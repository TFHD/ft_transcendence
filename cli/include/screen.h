/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   screen.h                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rgramati <rgramati@42angouleme.fr>         +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/10 19:14:41 by rgramati          #+#    #+#             */
/*   Updated: 2025/05/10 21:02:22 by rgramati         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#ifndef SCREEN_H
# define SCREEN_H

# include <termios.h>
# include <sys/ioctl.h>

# define COLOR_TABLE \
	"000\000001\000002\000003\000004\000005\000006\000007\000"\
	"008\000009\000010\000011\000012\000013\000014\000015\000"\
	"016\000017\000018\000019\000020\000021\000022\000023\000"\
	"024\000025\000026\000027\000028\000029\000030\000031\000"\
	"032\000033\000034\000035\000036\000037\000038\000039\000"\
	"040\000041\000042\000043\000044\000045\000046\000047\000"\
	"048\000049\000050\000051\000052\000053\000054\000055\000"\
	"056\000057\000058\000059\000060\000061\000062\000063\000"\
	"064\000065\000066\000067\000068\000069\000070\000071\000"\
	"072\000073\000074\000075\000076\000077\000078\000079\000"\
	"080\000081\000082\000083\000084\000085\000086\000087\000"\
	"088\000089\000090\000091\000092\000093\000094\000095\000"\
	"096\000097\000098\000099\000100\000101\000102\000103\000"\
	"104\000105\000106\000107\000108\000109\000110\000111\000"\
	"112\000113\000114\000115\000116\000117\000118\000119\000"\
	"120\000121\000122\000123\000124\000125\000126\000127\000"\
	"128\000129\000130\000131\000132\000133\000134\000135\000"\
	"136\000137\000138\000139\000140\000141\000142\000143\000"\
	"144\000145\000146\000147\000148\000149\000150\000151\000"\
	"152\000153\000154\000155\000156\000157\000158\000159\000"\
	"160\000161\000162\000163\000164\000165\000166\000167\000"\
	"168\000169\000170\000171\000172\000173\000174\000175\000"\
	"176\000177\000178\000179\000180\000181\000182\000183\000"\
	"184\000185\000186\000187\000188\000189\000190\000191\000"\
	"192\000193\000194\000195\000196\000197\000198\000199\000"\
	"200\000201\000202\000203\000204\000205\000206\000207\000"\
	"208\000209\000210\000211\000212\000213\000214\000215\000"\
	"216\000217\000218\000219\000220\000221\000222\000223\000"\
	"224\000225\000226\000227\000228\000229\000230\000231\000"\
	"232\000233\000234\000235\000236\000237\000238\000239\000"\
	"240\000241\000242\000243\000244\000245\000246\000247\000"\
	"248\000249\000250\000251\000252\000253\000254\000255\000"

typedef struct
{
	char		*data;
	uint32_t	width;
	uint32_t	height;
}	TCLI_Screen;

static inline uint32_t	screen_mode(uint32_t mode)
{
	struct termios			attr;
	static struct termios	back;

	if (!isatty(STDIN_FILENO))
		return (1);
	tcgetattr(STDIN_FILENO, &back);
	if (mode)
	{
		attr = back;
		attr.c_lflag &= ~(ICANON | ECHO);
		attr.c_cc[VMIN] = 0;
		attr.c_cc[VTIME] = 0;
		tcsetattr(STDIN_FILENO, TCSAFLUSH, &attr);
		write(STDIN_FILENO, "\033[?25l", 6);
	}
	else
	{
		tcsetattr(STDIN_FILENO, TCSANOW, &back);
		write(STDIN_FILENO, "\033[?25h", 6);
	}
	return (0);
}

static inline void	screen_ttySize(uint32_t *row, uint32_t *col)
{
	struct winsize	win;

	ioctl(STDIN_FILENO, TIOCGWINSZ, &win);
	*row = win.ws_row;
	*col = win.ws_col;
}

# define	SCREEN_CHAR_SIZE	41
# define	SCREEN_HBLOCK		"▄"
# define	SCREEN_CHAR_BLACK	"\033[38;2;000;000;000m\033[48;2;000;000;000m"

static inline void	screen_init(TCLI_Screen *screen)
{
	uint32_t	row;
	uint32_t	col;

	screen_ttySize(&row, &col);
	screen->data = malloc(row * col * SCREEN_CHAR_SIZE + 1);
	if (screen->data)
	{
		memset(screen->data, 0, row * col * SCREEN_CHAR_SIZE + 1);
		screen->width = col;
		screen->height = row;
		screen_mode(1);
		for (uint32_t i = 0; i < row * col; ++i)
		{
			strcat(screen->data, SCREEN_CHAR_BLACK);
			strcat(screen->data, SCREEN_HBLOCK);
		}
	}
}

static inline void	screen_destroy(TCLI_Screen *screen)
{
	screen_mode(0);
	free(screen->data);
}

static void	screen_strcpy(char *dst, char *src)
{
	while (*src)
		*dst++ = *src++;
}

static inline void	screen_put_color(uint32_t color, char *ptr)
{
	uint32_t	comp;

	color &= ~(0xFF << 24);
	comp = (color & 0xFF0000) >> 14;
	screen_strcpy(&ptr[7], &COLOR_TABLE[comp]);
	comp = (color & 0xFF00) >> 6;
	screen_strcpy(&ptr[11], &COLOR_TABLE[comp]);
	comp = (color & 0xFF) << 2;
	screen_strcpy(&ptr[15], &COLOR_TABLE[comp]);
}

static inline void	screen_set_pixel(TCLI_Screen *screen, uint32_t x, uint32_t y, uint32_t color)
{
	uint32_t	cx;
	uint32_t	cy;
	uint32_t	index;

	if (x < 0 || y < 0 || x >= screen->width || (y & ~1) >= screen->height * 2)
		return ;
	cx = (SCREEN_CHAR_SIZE * x) + (19 * !(y & 1));
	cy = (y >> 1);
	index = ((SCREEN_CHAR_SIZE * screen->width) * cy) + cx;
	screen_put_color(color, &screen->data[index]);
}

typedef struct
{
	int32_t	x;
	int32_t	y;
}	vec2;

typedef struct
{
	float	x;
	float	y;
}	fvec2;

int my_abs(int n)
{
	if (n < 0)
		return (-n);
	return (n);
}

void	screen_draw_line(TCLI_Screen *screen, vec2 start, vec2 end, uint32_t color)
{
	vec2		diff;
	fvec2		deltas;
	fvec2		inc;
	float		max;

	diff = (vec2){.x = end.x - start.x, .y = end.y - start.y};
	max = (float)my_abs((int32_t[2]){diff.x, diff.y}[my_abs(diff.x) < my_abs(diff.y)]);
	deltas = (fvec2){diff.x / max, diff.y / max};
	inc = (fvec2){start.x, start.y};
	
	int test = (int)max;

	while (test--)
	{
		screen_set_pixel(screen, (int)inc.x, (int)inc.y, color);
		inc.x += deltas.x;
		inc.y += deltas.y;
	}
}

void	screen_draw_square(TCLI_Screen *screen, vec2 start, vec2 size, uint32_t color)
{
	const vec2	end = (vec2){start.x + size.x - 1, start.y + size.y - 1};

	screen_draw_line(screen, start, (vec2){end.x, start.y}, color);
	screen_draw_line(screen, (vec2){end.x, start.y}, end, color);
	screen_draw_line(screen, end, (vec2){start.x, end.y}, color);
	screen_draw_line(screen, (vec2){start.x, end.y}, (vec2)start, color);
}


#endif
