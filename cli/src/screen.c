/**
 * screen.c
 */

#include <screen.h>

TCLI_INTERN(ttySize)(uint32_t *row, uint32_t *col)
{
	struct winsize	win;

	ioctl(STDIN_FILENO, TIOCGWINSZ, &win);
	*row = win.ws_row;
	*col = win.ws_col;
}

TCLI_INTERN(screenMode)(uint32_t mode)
{
	struct termios			attr;
	static struct termios	back;

	if (!isatty(STDIN_FILENO))
		return ;
	tcgetattr(STDIN_FILENO, &back);
	if (mode)
	{
		attr = back;
		attr.c_lflag &= ~(ICANON | ECHO);
		attr.c_cc[VMIN] = 0;
		attr.c_cc[VTIME] = 0;
		tcsetattr(STDIN_FILENO, TCSAFLUSH, &attr);
		write(STDOUT_FILENO, "\033[?25l", 6);
	}
	else
	{
		tcsetattr(STDIN_FILENO, TCSANOW, &back);
		write(STDOUT_FILENO, "\033[?25h", 6);
	}
}

TCLI_INTERN(strcpy)(char *dst, char *src)
{
	while (*src) *dst++ = *src++;
}

TCLI_INTERN(screenPutColor)(uint32_t color, char *ptr)
{
	uint32_t	comp;

	color &= ~(0xFF << 24);
	comp = (color & 0xFF0000) >> 14;
	TCLI_strcpy(&ptr[7], &COLOR_TABLE[comp]);
	comp = (color & 0xFF00) >> 6;
	TCLI_strcpy(&ptr[11], &COLOR_TABLE[comp]);
	comp = (color & 0xFF) << 2;
	TCLI_strcpy(&ptr[15], &COLOR_TABLE[comp]);
}

TCLI_API(screenSetPixel)(TCLI_Screen *screen, vec2 pos, uint32_t color)
{
	uint32_t	cx;
	uint32_t	cy;
	uint32_t	index;

	if (pos.x < 0 || pos.y < 0 || pos.x >= screen->width || (pos.y & ~1) >= screen->height * 2)
		return ;
	cx = (TCLI_CHAR_SIZE * pos.x) + (19 * !(pos.y & 1));
	cy = (pos.y >> 1);
	index = ((TCLI_CHAR_SIZE * screen->width) * cy) + cx;
	TCLI_screenPutColor(color, &screen->data[index]);
}

TCLI_API(screenClear)(TCLI_Screen *screen)
{
	for (int32_t j = 0; j < screen->height * 2; ++j)
	{
		for (int32_t i = 0; i < screen->width; ++i)
			TCLI_screenSetPixel(screen, (vec2){i, j}, 0);
	}
}

TCLI_API(screenDrawText)(TCLI_Screen *screen, const char *text, vec2 start, uint32_t color)
{
	vec2	offset = {0};
	vec2	charpos = {0};

	while (*text)
	{
		if (*text < 32)
		{
			text++;
			continue ;
		}

		const int rep = TCLI_font[(int)(*text - 32)];
		for (uint32_t i = 0; i < 5; ++i)
		{
			for (uint32_t j = 0; j < 3; ++j)
			{
				if (!(rep & (1 << (3 * i + j))))
					continue ;
				charpos = (vec2)
				{
					start.x + j + (4 * offset.x),
					start.y + i + (6 * offset.y)
				};
				TCLI_screenSetPixel(screen, charpos, color);
			}
		}
		offset.x++;
		text++;
	}
}

TCLI_API(screenDrawLine)(TCLI_Screen *screen, vec2 start, vec2 end, uint32_t color)
{
	vec2	diff;
	vec2	absdiff;
	fvec2	deltas;
	fvec2	inc;
	float	max;

	diff = (vec2){.x = end.x - start.x, .y = end.y - start.y};
	absdiff = (vec2){ABS(diff.x), ABS(diff.y)};
	max = MAX(absdiff.x, absdiff.y);
	max = ABS(max);
	deltas = (fvec2){diff.x / max, diff.y / max};
	inc = (fvec2){start.x, start.y};
	
	int test = (int)max;

	while (test--)
	{
		vec2	pos = {inc.x, inc.y};
		TCLI_screenSetPixel(screen, pos, color);
		inc.x += deltas.x;
		inc.y += deltas.y;
	}
}

TCLI_API(screenDrawSquare)(TCLI_Screen *screen, vec2 start, vec2 size, uint32_t color, uint8_t rounded)
{
	const vec2	end = (vec2){start.x + size.x - 1, start.y + size.y - 1};

	rounded = !!rounded;
	TCLI_screenDrawLine(screen, (vec2){start.x + rounded, start.y}, (vec2){end.x, start.y}, color);
	TCLI_screenDrawLine(screen, (vec2){end.x, start.y + rounded}, end, color);
	TCLI_screenDrawLine(screen, (vec2){end.x - rounded, end.y}, (vec2){start.x, end.y}, color);
	TCLI_screenDrawLine(screen, (vec2){start.x, end.y - rounded}, (vec2)start, color);
}

TCLI_API(screenDrawImg)(TCLI_Screen *screen, vec2 start, vec2 size, uint32_t *img)
{
	for (int32_t j = 0; j < size.y; ++j)
	{
		for (int32_t i = 0; i < size.x; ++i)
		{
			int32_t	index = j * size.y + i;

			TCLI_screenSetPixel(screen, (vec2){start.x + i, start.y + j}, img[index]);
		}
	}
}

TCLI_API(screenInit)(TCLI_Screen *screen)
{
	uint32_t	row;
	uint32_t	col;

	TCLI_ttySize(&row, &col);
	// TODO: force terminal to be big enough...
	screen->data = malloc(row * col * TCLI_CHAR_SIZE + 1);
	if (screen->data)
	{
		memset(screen->data, 0, row * col * TCLI_CHAR_SIZE + 1);
		screen->width = col;
		screen->height = row;
		TCLI_screenMode(1);
		for (uint32_t i = 0; i < row * col; ++i)
		{
			strcat(screen->data, TCLI_VOIDC);
			strcat(screen->data, TCLI_HBLOCK);
		}
	}
}

TCLI_API(screenDestroy)(TCLI_Screen *screen)
{
	TCLI_screenMode(0);
	free(screen->data);
}
