/**
 * context.h
 */

#ifndef _TRANSCENDENCE_H
# define _TRANSCENDENCE_H

# include <unistd.h>
# include <stdio.h>
# include <string.h>
# include <stdlib.h>
# include <stdarg.h>
# include <stdint.h>
# include <termios.h>
# include <sys/ioctl.h>

# include <curl.h>
# include <cJSON.h>
# include <nopoll.h>

# define	SHIFT(ac, av)	(ac-- ,*av++)

# define	TCLI(X)			TCLI_##X
# define	TCLI_API(X)		void TCLI(X)
# define	TCLI_INTERN(X)	static TCLI_API(X)

# define	CURL_CTX	__curl_ctx
# define	TCLI_CTX	__TCLI_ctx
# define	TCLI_TMP	__TCLI_tmp

# define	TCLI_STATUS			TCLI_CTX->status
# define	TCLI_ACTIVE			(TCLI_CTX->status & TCLI_FLAG_OK)

# define	TCLI_SCREEN			TCLI_CTX->screen
# define	TCLI_WIDTH			TCLI_CTX->screen.width
# define	TCLI_HEIGHT			(TCLI_CTX->screen.height * 2)

# define	TCLI_SCENE			TCLI_CTX->scene

# define	TCLI_EXE			TCLI_CTX->prog_name

# define	TCLI_URL			TCLI_CTX->url
# define	TCLI_URL_HDR		"https://Trans:8000/api/"

# define	TCLI_IP				TCLI_CTX->ip

# define	TCLI_RESOLVE		TCLI_CTX->resolve
# define	TCLI_CERT_PATH		"auth/cert.pem"

# define	TCLI_COOKIE			TCLI_CTX->cookie
# define	TCLI_COOKIE_LEN		152
# define	TCLI_COOKIE_FP		".cookiejar"

# define	TCLI_HDRS			TCLI_CTX->headers
# define	TCLI_TOKEN_HDR		"authorization: Bearer "

# define	TCLI_POSTFIELDS		TCLI_CTX->postfields

# define	COLOR_TABLE \
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

static const int	TCLI(font)[] =
{
	0b000000000000000, 0b010000010010010, 0b000000000101101, 0b101111101111101,
	0b011110011111010, 0b101001010100101, 0b110101010101010, 0b000000000010010,
	0b010001001001010, 0b010100100100010, 0b000000101010101, 0b000010111010000,
	0b001010000000000, 0b000000111000000, 0b010000000000000, 0b001010010100100,
	0b111101101101111, 0b111010010011010, 0b111001010100011, 0b011100010100011,
	0b100100111101101, 0b111100111001111, 0b111101111001111, 0b010010010100111,
	0b111101111101111, 0b111100111101111, 0b000010000010000, 0b010010000010000,
	0b000010001010000, 0b000111000111000, 0b000010100010000, 0b010000010100111,
	0b111001101111000, 0b101101111101010, 0b011101011101011, 0b110001001001110,
	0b011101101101011, 0b111001011001111, 0b001001011001111, 0b111101101001111,
	0b101101111101101, 0b111010010010111, 0b111101100100100, 0b101101011101101,
	0b111001001001001, 0b101101101111101, 0b101101101101011, 0b010101101101010,
	0b001001011101011, 0b100011101101111, 0b101101011101011, 0b011100010001110,
	0b010010010010111, 0b111101101101101, 0b010101101101101, 0b101111101101101,
	0b101101010101101, 0b010010010101101, 0b111001010100111, 0b011001001001011,
	0b100010010001001, 0b110100100100110, 0b000000000101010, 0b111000000000000,
	0b000000000010001, 0b110101101110000, 0b011101011001001, 0b110001001110000,
	0b110101110100100, 0b110011101110000, 0b010010111010110, 0b011100110101110,
	0b101101011001001, 0b010010010000010, 0b001010010000010, 0b101011101001001,
	0b100010010010010, 0b101101111101000, 0b101101101011000, 0b010101101010000,
	0b001011101011000, 0b100110101110000, 0b001001011101000, 0b011100011110000,
	0b110010010111010, 0b110101101101000, 0b010101101101000, 0b101111101101000,
	0b101101010101000, 0b001010101101000, 0b111010100111000, 0b110010001010110,
	0b010010010010010, 0b011010100010011, 0b000000000011110
};

typedef struct	_tcli_screen	TCLI(Screen);

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

struct	_tcli_screen
{
	char	*data;
	int32_t	width;
	int32_t	height;
};

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

# define	SCREEN_CHAR_SIZE	41
# define	SCREEN_HBLOCK		"▄"
# define	SCREEN_CHAR_BLACK	"\033[38;2;000;000;000m\033[48;2;000;000;000m"

TCLI_INTERN(screenInit)(TCLI(Screen) *screen)
{
	uint32_t	row;
	uint32_t	col;

	TCLI(ttySize)(&row, &col);
	// TODO: force terminal to be big enough...
	screen->data = malloc(row * col * SCREEN_CHAR_SIZE + 1);
	if (screen->data)
	{
		memset(screen->data, 0, row * col * SCREEN_CHAR_SIZE + 1);
		screen->width = col;
		screen->height = row;
		TCLI(screenMode)(1);
		for (uint32_t i = 0; i < row * col; ++i)
		{
			strcat(screen->data, SCREEN_CHAR_BLACK);
			strcat(screen->data, SCREEN_HBLOCK);
		}
	}
}

TCLI_INTERN(screenDestroy)(TCLI(Screen) *screen)
{
	TCLI(screenMode)(0);
	free(screen->data);
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
	TCLI(strcpy)(&ptr[7], &COLOR_TABLE[comp]);
	comp = (color & 0xFF00) >> 6;
	TCLI(strcpy)(&ptr[11], &COLOR_TABLE[comp]);
	comp = (color & 0xFF) << 2;
	TCLI(strcpy)(&ptr[15], &COLOR_TABLE[comp]);
}

TCLI_INTERN(screenSetPixel)(TCLI(Screen) *screen, vec2 pos, uint32_t color)
{
	uint32_t	cx;
	uint32_t	cy;
	uint32_t	index;

	if (pos.x < 0 || pos.y < 0 || pos.x >= screen->width || (pos.y & ~1) >= screen->height * 2)
		return ;
	cx = (SCREEN_CHAR_SIZE * pos.x) + (19 * !(pos.y & 1));
	cy = (pos.y >> 1);
	index = ((SCREEN_CHAR_SIZE * screen->width) * cy) + cx;
	TCLI(screenPutColor)(color, &screen->data[index]);
}

TCLI_INTERN(screenClear)(TCLI(Screen) *screen)
{
	for (int32_t j = 0; j < screen->height * 2; ++j)
	{
		for (int32_t i = 0; i < screen->width; ++i)
			TCLI(screenSetPixel)(screen, (vec2){i, j}, 0);
	}
}

static inline int my_abs(int n)
{
	if (n < 0)
		return (-n);
	return (n);
}

TCLI_INTERN(screenDrawText)(TCLI_Screen *screen, const char *text, vec2 start, uint32_t color)
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
				TCLI(screenSetPixel)(screen, charpos, color);
			}
		}
		offset.x++;
		text++;
	}
}

TCLI_INTERN(screenDrawLine)(TCLI(Screen) *screen, vec2 start, vec2 end, uint32_t color)
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
		vec2	pos = {inc.x, inc.y};
		TCLI(screenSetPixel)(screen, pos, color);
		inc.x += deltas.x;
		inc.y += deltas.y;
	}
}

TCLI_INTERN(screenDrawSquare)(TCLI(Screen) *screen, vec2 start, vec2 size, uint32_t color, uint8_t rounded)
{
	const vec2	end = (vec2){start.x + size.x - 1, start.y + size.y - 1};

	rounded = !!rounded;
	TCLI(screenDrawLine)(screen, (vec2){start.x + rounded, start.y}, (vec2){end.x, start.y}, color);
	TCLI(screenDrawLine)(screen, (vec2){end.x, start.y + rounded}, end, color);
	TCLI(screenDrawLine)(screen, (vec2){end.x - rounded, end.y}, (vec2){start.x, end.y}, color);
	TCLI(screenDrawLine)(screen, (vec2){start.x, end.y - rounded}, (vec2)start, color);
}

TCLI_INTERN(screenDrawImg)(TCLI(Screen) *screen, vec2 start, vec2 size, uint32_t *img)
{
	for (int32_t j = 0; j < size.y; ++j)
	{
		for (int32_t i = 0; i < size.x; ++i)
		{
			int32_t	index = j * size.y + i;

			TCLI(screenSetPixel)(screen, (vec2){start.x + i, start.y + j}, img[index]);
		}
	}
}
# define	TCLI_ELEM_LAST ((void *)-1UL)

enum
{
	TCLI_IDX_BOX = 0,
	TCLI_IDX_TEXT = 1,
	TCLI_IDX_INPUT = 2,
	TCLI_IDX_LAST = 4
};

enum
{
	TCLI_ELEM_TEXT = 0,
	TCLI_ELEM_TEXTBOX = 1,
	TCLI_ELEM_BUTTON = 2,
	TCLI_ELEM_IMAGE = 3,
};

enum
{
	TCLI_ARROW_UP = 0,
	TCLI_ARROW_DOWN = 1,
	TCLI_ARROW_RIGHT = 2,
	TCLI_ARROW_LEFT = 3,
};

# define	TCLI_SCENE_FUNC(X)	TCLI_SceneCtx	*TCLI(X)(void)

typedef struct	_tcli_elemHdr		TCLI(ElemHdr);
typedef union	_tcli_action		TCLI(Action);
typedef struct	_tcli_elem			TCLI(Elem);
typedef struct	_tcli_actionQueue	TCLI(ActionQueue);
typedef struct	_tcli_sceneCtx		TCLI(SceneCtx);

typedef TCLI(SceneCtx)	*(*TCLI(Scene))(void);
typedef void			(*TCLI(Modifier))(TCLI(ElemHdr) *elem);
typedef void			(*TCLI(Loader))(TCLI(ElemHdr) *elem);
typedef void			(*TCLI(Renderer))(TCLI(Elem) *);

struct	_tcli_elemHdr
{
	uint32_t	type;
	uint32_t	flags;
};

union	_tcli_action
{
	TCLI(Modifier)	modif;
	TCLI(Loader)	load;
};

struct	_tcli_elem
{
	TCLI(ElemHdr)		h;
	struct _tcli_elem	*nexts[4];
	char				txt[16];
	char				input[16];
	uint32_t			*image;
	uint32_t			colors[4];
	vec2				pos[4];
	vec2				size;
	TCLI(Action)		onEnter;
	TCLI(Action)		onSelect;
	TCLI(Action)		onDeselect;
};

struct	_tcli_actionQueue
{
	TCLI(Action)	actions[16];
	uint32_t		head;
	uint32_t		tail;
};

struct	_tcli_sceneCtx
{
	TCLI(Elem)			elems[16];
	TCLI(Elem)			*select;
	TCLI(Elem)			*last;
	TCLI(ActionQueue)	actions;
	uint32_t			elemCount;
};

typedef struct s_cli_ctx
{
	uint64_t			status;
	TCLI_Screen			screen;
	TCLI_Scene			scene;

	const char			*prog_name;
	const char			*ip;
	const char			*url;
	struct curl_slist	*resolve;
	struct curl_slist	*cookie;
	struct curl_slist	*headers;
	const char			*postfields;
}	TCLI;

extern	CURL		*CURL_CTX;
extern	TCLI		*TCLI_CTX;
extern	char		TCLI_TMP[1024];

enum
{
	TCLI_FLAG_OK	= 1 << 0,
	TCLI_SCENE_SWAP	= 1 << 1,
}	TCLI_Flags;

# define	TCLI_USAGE	"[%s] Usage: %s \033[1mIP\033[0m\n"

// TCLI  --  Core functions for init, cleanup and errors.

TCLI_API(init)(int argc, char **argv);
TCLI_API(cleanup)(void);
TCLI_API(error)(const char *msg);
TCLI_API(usage)(int err);

TCLI_INTERN(cookieInit)(void);
TCLI_INTERN(ipResolve)(void);

TCLI_API(init)(int argc, char **argv)
{
	if (TCLI_CTX)
		return ;

	TCLI_CTX = malloc(sizeof(TCLI));
	if (!TCLI_CTX)
		TCLI(error)("failed to init TCLI context.");
	memset(TCLI_CTX, 0, sizeof(TCLI));
	
	TCLI(screenInit)(&TCLI_SCREEN);
	if (!TCLI_SCREEN.data)
		TCLI(error)("failed to init TCLI screen.");
	
	TCLI_EXE = SHIFT(argc, argv);
	if (argc != 1)
		TCLI(usage)(1);
	TCLI_IP = SHIFT(argc, argv);

	CURL_CTX = curl_easy_init();
	if (!CURL_CTX)
		TCLI(error)("failed to init CURL context.");

	curl_easy_setopt(CURL_CTX,  CURLOPT_VERBOSE, 1L);
	curl_easy_setopt(CURL_CTX,  CURLOPT_TIMEOUT, 10L);
	curl_easy_setopt(CURL_CTX, CURLOPT_CAINFO, TCLI_CERT_PATH);
	curl_easy_setopt(CURL_CTX, CURLOPT_SSL_VERIFYPEER, 1L);	// Need SSL verification
	curl_easy_setopt(CURL_CTX, CURLOPT_SSL_VERIFYHOST, 2L);

	TCLI(cookieInit)();
	TCLI(ipResolve)();

	TCLI_STATUS |= TCLI_FLAG_OK;
}

TCLI_API(cleanup)(void)
{
	TCLI(screenDestroy)(&TCLI_CTX->screen);
	if (TCLI_RESOLVE)
		curl_slist_free_all(TCLI_RESOLVE);
	if (TCLI_COOKIE)
		curl_slist_free_all(TCLI_COOKIE);
	if (TCLI_HDRS)
		curl_slist_free_all(TCLI_HDRS);
	if (CURL_CTX)
		curl_easy_cleanup(CURL_CTX);
	free(TCLI_CTX);
}

TCLI_API(error)(const char *msg)
{
	if (msg)
		printf("[%s] Error: %s\n", TCLI_EXE, msg);
	exit(1);
}

TCLI_API(usage)(int err)
{
	printf(TCLI_USAGE, TCLI_EXE, TCLI_EXE);
	exit(err);
}

TCLI_INTERN(cookieInit)(void)
{
	curl_easy_setopt(CURL_CTX, CURLOPT_COOKIEFILE, "");
	curl_easy_setopt(CURL_CTX, CURLOPT_COOKIEJAR, TCLI_COOKIE_FP);
}

TCLI_INTERN(ipResolve)(void)
{
	if (TCLI_RESOLVE)
		return ;
	
	const uint32_t	ipl = strlen(TCLI_IP);

	memcpy(TCLI_TMP, "Trans:8000:", 11);
	memcpy(TCLI_TMP + 11, TCLI_IP, ipl);

	TCLI_TMP[11 + ipl] = 0;

	TCLI_RESOLVE = curl_slist_append(NULL, TCLI_TMP);

	curl_easy_setopt(CURL_CTX, CURLOPT_RESOLVE, TCLI_RESOLVE);
}


TCLI_API(handleAction)(TCLI_SceneCtx *ctx)
{
	(void) ctx;
}

TCLI_API(handleJump)(TCLI_SceneCtx *ctx, char key)
{
	TCLI(Elem)	*current = ctx->select;
	TCLI(Elem)	*next = current->nexts[(int)key];

	if (!next)
		return ;

	//current->onDeselect(&current->h);

	if (next == (void *)TCLI_ELEM_LAST)
	{
		if (!ctx->last)
			return ;
		ctx->select = ctx->last;
		next = ctx->select;
	}
	else
		ctx->select = next;
	ctx->last = current;

	//next->onSelect(&next->h);
}

TCLI_API(handleInput)(TCLI(SceneCtx) *ctx, char key)
{
	(void) ctx;
	(void) key;

	TCLI(Elem)	*current = ctx->select;

	if (current->h.type == TCLI_ELEM_TEXTBOX)
	{
		uint32_t	len = strlen(current->input);
		if (len >= 15)
			return ;
		if (key == 127 && len > 0)
			current->input[len - 1] = 0;	
		else
			current->input[len] = key;
	}
}

TCLI_API(handleKey)(TCLI(SceneCtx) *ctx, char key)
{
	if (key < 4)
		TCLI_handleJump(ctx, key);
	else if (key == '\n')
		TCLI(handleAction)(ctx);
	else
		TCLI(handleInput)(ctx, key);
}

// RENDERERS -------------------------------------------

TCLI_API(renderImage)(TCLI(Elem) *e)
{
	TCLI(screenDrawImg)
	(
		&TCLI_SCREEN,
		e->pos[TCLI_IDX_BOX], e->size, e->image
	);
}

TCLI_API(renderText)(TCLI(Elem) *e)
{
	TCLI(screenDrawText)
	(
		&TCLI_SCREEN,
		e->txt, e->pos[TCLI_IDX_TEXT], e->colors[TCLI_IDX_TEXT]
	);
}

TCLI_API(renderTextbox)(TCLI(Elem) *e)
{
	TCLI(screenDrawSquare)
	(
		&TCLI_SCREEN,
		e->pos[TCLI_IDX_BOX], e->size, e->colors[TCLI_IDX_BOX], 1
	);
	TCLI(screenDrawText)
	(
		&TCLI_SCREEN,
		e->txt, e->pos[TCLI_IDX_TEXT], e->colors[TCLI_IDX_TEXT]
	);
	TCLI(screenDrawText)
	(
		&TCLI_SCREEN,
		e->input, e->pos[TCLI_IDX_INPUT], e->colors[TCLI_IDX_INPUT]
	);
}

TCLI_API(renderButton)(TCLI(Elem) *e)
{
	TCLI(screenDrawSquare)
	(
		&TCLI_SCREEN,
		e->pos[TCLI_IDX_BOX], e->size, e->colors[TCLI_IDX_BOX], 1
	);
	TCLI(screenDrawText)
	(
		&TCLI_SCREEN,
		e->txt, e->pos[TCLI_IDX_TEXT], e->colors[TCLI_IDX_TEXT]
	);
}

const TCLI(Renderer)	_renderers[4] = 
{
	TCLI(renderText),
	TCLI(renderTextbox),
	TCLI(renderButton),
	TCLI(renderImage),
};

TCLI_API(render)(TCLI(SceneCtx) *ctx)
{
	if (!ctx)
		return ;
// 	if (ctx->select)
// 		ctx->select->onSelect(&ctx->select->h);
	for (uint32_t i = 1; i < ctx->elemCount; ++i)
	{
		TCLI(Elem)	*curr = &ctx->elems[i];

		_renderers[curr->h.type](curr);
	}
}

// ELEMENT CONSTRUCTORS ------------------------------------------

TCLI_API(rootElem)(TCLI(SceneCtx) *ctx)
{
	memset(ctx->elems, 0xFF, sizeof(TCLI(Elem)));
	ctx->elemCount++;
}

TCLI(Elem)	*TCLI(newButton)
(TCLI(SceneCtx) *ctx, const char *txt, vec2 pos, vec2 size, uint32_t txtColor, uint32_t boxColor)
{
	TCLI(Elem)	*button = &ctx->elems[ctx->elemCount];

	button->h = (TCLI(ElemHdr)){.type = TCLI_ELEM_BUTTON};

	button->pos[TCLI_IDX_BOX] = pos;
	button->colors[TCLI_IDX_BOX] = boxColor;
	button->size = size;

	uint32_t	txtLen = strlen(txt);

	memcpy(button->txt, txt, txtLen);

	uint32_t	txtX = pos.x + (size.x - (txtLen * 4)) / 2 + 1;
	uint32_t	txtY = pos.y + (size.y - 5) / 2;

	button->pos[TCLI_IDX_TEXT] = (vec2){txtX, txtY};
	button->colors[TCLI_IDX_TEXT] = txtColor;

	ctx->elemCount++;

	return (button);
}

TCLI(Elem)	*TCLI(newText)
(TCLI(SceneCtx) *ctx, const char *txt, vec2 pos, uint32_t txtColor)
{
	TCLI(Elem)	*text = &ctx->elems[ctx->elemCount];

	text->h = (TCLI(ElemHdr)){.type = TCLI_ELEM_TEXT};

	text->pos[TCLI_IDX_BOX] = pos;

	uint32_t	txtLen = strlen(txt);
	memcpy(text->txt, txt, txtLen);

	text->pos[TCLI_IDX_TEXT] = pos;
	text->colors[TCLI_IDX_TEXT] = txtColor;

	text->size = (vec2) {txtLen * 4, 6};

	ctx->elemCount++;

	return (text);
}

TCLI(Elem)	*TCLI(newTextbox)
(TCLI_SceneCtx *ctx, const char *txt, vec2 pos, uint32_t txtColor)
{
	TCLI(Elem)	*textbox = &ctx->elems[ctx->elemCount];

	textbox->h = (TCLI(ElemHdr)){.type = TCLI_ELEM_TEXTBOX};

	textbox->pos[TCLI_IDX_TEXT] = (vec2){pos.x + 2, pos.y + 2};
	textbox->colors[TCLI_IDX_BOX] = txtColor;
	textbox->colors[TCLI_IDX_TEXT] = txtColor;
	textbox->colors[TCLI_IDX_INPUT] = txtColor;
	
	uint32_t	txtLen = strlen(txt);
	memcpy(textbox->txt, txt, txtLen);

	textbox->size = (vec2) {16 * 4, 9};

	textbox->pos[TCLI_IDX_BOX] = (vec2){pos.x + txtLen * 4 + 1, pos.y};
	textbox->pos[TCLI_IDX_INPUT] = (vec2){pos.x + txtLen * 4 + 3, pos.y + 2};

	ctx->elemCount++;
	
	return (textbox);
}

// ATTRIBUTE SETTERS --------------------------------------------------

TCLI_API(setPos)(TCLI(Elem) *elem, uint8_t idx, vec2 pos)
{
	if (!elem || idx >= TCLI_IDX_LAST)
		return ;
	elem->pos[idx] = pos;
}

TCLI_API(setColor)(TCLI(Elem) *elem, uint8_t idx, uint32_t color)
{
	if (!elem || idx >= TCLI_IDX_LAST)
		return ;
	elem->colors[idx] = color;
}

TCLI_API(setNext)(TCLI(Elem) *elem, uint8_t idx, TCLI(Elem) *next)
{
	if (!elem || idx >= TCLI_IDX_LAST)
		return ;
	elem->nexts[idx] = next;
}
// SCENE FUNCTIONS -----------------------------------------------

TCLI_SCENE_FUNC(loginPage)
{
	static TCLI(SceneCtx) ctx = {0};
	if (ctx.elemCount == 0)
	{
 		TCLI(rootElem)(&ctx);

		TCLI(Elem)	*_buttonBack = TCLI_newButton(
			&ctx, "< Back",
			(vec2) {1, TCLI_HEIGHT - 12},
			(vec2) {27, 11},
			0xc3c3c3, 0xc3c3c3
		);
		TCLI(Elem)	*_buttonLogin = TCLI_newButton(
			&ctx, " Login ",
			(vec2) {TCLI_WIDTH / 2 - 17, 70},
			(vec2) {37, 11},
			0xc3c3c3, 0xc3c3c3
		);
		TCLI(Elem)	*_textboxUser = TCLI_newTextbox(&ctx, "Username : ", (vec2){67, 30}, 0xFFFFFFFF);
		TCLI(Elem)	*_textboxPass = TCLI_newTextbox(&ctx, "Password : ", (vec2){67, 42}, 0xFFFFFFFF);

		TCLI(setNext)(_buttonBack, TCLI_ARROW_RIGHT, TCLI_ELEM_LAST);

		TCLI(setNext)(_textboxUser, TCLI_ARROW_DOWN,	_textboxPass);
		TCLI(setNext)(_textboxUser, TCLI_ARROW_LEFT,	_buttonBack);

		TCLI(setNext)(_textboxPass, TCLI_ARROW_UP,		_textboxUser);
		TCLI(setNext)(_textboxPass, TCLI_ARROW_DOWN,	_buttonLogin);
		TCLI(setNext)(_textboxPass, TCLI_ARROW_LEFT,	_buttonBack);
		
		TCLI(setNext)(_buttonLogin, TCLI_ARROW_UP,		_textboxPass);
		TCLI(setNext)(_buttonLogin, TCLI_ARROW_LEFT,	_buttonBack);

		ctx.select = _textboxUser;
	}
	return (&ctx);
}

TCLI_SCENE_FUNC(registerPage)
{
	static TCLI(SceneCtx) ctx = {0};
	if (ctx.elemCount == 0)
	{
 		TCLI(rootElem)(&ctx);

		TCLI(Elem)	*_buttonBack = TCLI(newButton)
		(
			&ctx, "< Back",
			(vec2) {1, TCLI_HEIGHT - 12},
			(vec2) {27, 11},
			0xc3c3c3, 0xc3c3c3
		);
		TCLI(setNext)(_buttonBack, TCLI_ARROW_RIGHT, TCLI_ELEM_LAST);
		
		ctx.select = _buttonBack;
	}
	return (&ctx);
}

TCLI_SCENE_FUNC(settingsPage)
{
	static TCLI(SceneCtx) ctx = {0};
	if (ctx.elemCount == 0)
	{

	}
	return (&ctx);
}

TCLI_SCENE_FUNC(lobbyPage)
{
	static TCLI(SceneCtx) ctx = {0};
	if (ctx.elemCount == 0)
	{

	}
	return (&ctx);
}

TCLI_SCENE_FUNC(gamePage)
{
	static TCLI(SceneCtx) ctx = {0};
	if (ctx.elemCount == 0)
	{

	}
	return (&ctx);
}

# define	TCLI_MENU_BTN_W		55

TCLI_SCENE_FUNC(mainMenu)
{
	static TCLI(SceneCtx) ctx = {0};

	if (ctx.elemCount == 0)
	{
 		TCLI(rootElem)(&ctx);

		TCLI(Elem)	*_buttonLogin = TCLI_newButton(
			&ctx, "Login",
			(vec2) {TCLI_WIDTH / 2 - (TCLI_MENU_BTN_W / 2 + 1), TCLI_HEIGHT / 2 - 7},
			(vec2) {TCLI_MENU_BTN_W, 11},
			0xc3c3c3, 0xc3c3c3
		);
		TCLI(Elem)	*_buttonRegister = TCLI_newButton(
			&ctx, "Register",
			(vec2) {TCLI_WIDTH / 2 - (TCLI_MENU_BTN_W / 2 + 1), TCLI_HEIGHT / 2 + 6},
			(vec2) {TCLI_MENU_BTN_W, 11},
			0xc3c3c3, 0xc3c3c3
		);
		TCLI(Elem)	*_buttonQuit = TCLI_newButton(
			&ctx, "Quit",
			(vec2) {TCLI_WIDTH / 2 - (TCLI_MENU_BTN_W / 2 + 1), TCLI_HEIGHT / 2 + 19},
			(vec2) {TCLI_MENU_BTN_W, 11},
			0xc3c3c3, 0xc3c3c3
		);

		TCLI(setNext)(_buttonLogin,		TCLI_ARROW_DOWN, _buttonRegister);
		TCLI(setNext)(_buttonRegister,	TCLI_ARROW_DOWN, _buttonQuit);
		TCLI(setNext)(_buttonRegister,	TCLI_ARROW_UP, _buttonLogin);
		TCLI(setNext)(_buttonQuit,		TCLI_ARROW_UP, _buttonRegister);

		ctx.select = _buttonLogin;
	}
	return (&ctx);
}

TCLI_SCENE_FUNC(debugPage)
{
	static TCLI(SceneCtx) ctx = {0};
	if (ctx.elemCount == 0)
	{

	}
	return (&ctx);
}

TCLI_SCENE_FUNC(quit)
{
	TCLI_STATUS &= ~TCLI_FLAG_OK;
	return (NULL);
}


// HTML THINGS

TCLI_API(cookieGet)(char **cookie)
{
	if (!cookie)
		return ;
	if (!TCLI_COOKIE)
		curl_easy_getinfo(CURL_CTX, CURLINFO_COOKIELIST, &(TCLI_COOKIE));
	if (!TCLI_COOKIE)
		*cookie = NULL;

	char	*cdata	= TCLI_COOKIE->data;
	char	*end	= cdata + strlen(cdata) - TCLI_COOKIE_LEN;
	
	*cookie = end;
}

TCLI_API(makeUrl)(const char *endpoint)
{
	const uint32_t	hdrl = strlen(TCLI_URL_HDR);
	const uint32_t	endl = strlen(endpoint);

	if (hdrl + endl >= 128)
		TCLI_error("request too long.");

	memcpy(TCLI_TMP,		TCLI_URL_HDR,	hdrl);
	memcpy(TCLI_TMP + hdrl,	endpoint,		endl);
	TCLI_TMP[hdrl + endl] = 0;

	TCLI_URL = strdup(TCLI_TMP);
}

TCLI_API(makeRequestHeaders)(int c, ...)
{
	va_list	hdr;

	va_start(hdr, c);
	while (c--)
	{
		char	*elem = va_arg(hdr, char *);

		TCLI_HDRS = curl_slist_append(TCLI_HDRS, elem);
	}
	va_end(hdr);
}

TCLI_API(makePostfields)(cJSON *post)
{
	TCLI_POSTFIELDS = cJSON_Print(post);
	cJSON_Delete(post);
}

# define	TCLI_JSON_HDR		"Content-Type: application/json"

# define	TCLI_ENDPOINT_LOGIN	"auth/login"

TCLI_API(login)(const char *user, const char *pass)
{
	TCLI(makeUrl)(TCLI_ENDPOINT_LOGIN);
	TCLI(makeRequestHeaders)(1, TCLI_JSON_HDR);

	cJSON	*log = cJSON_CreateObject();
	void	*tmp = NULL;

	tmp = cJSON_AddStringToObject(log, "email", user);
	if (!tmp) goto defer;

	tmp = cJSON_AddStringToObject(log, "username", user);
	if (!tmp) goto defer;
	
	tmp = cJSON_AddStringToObject(log, "password", pass);
	if (!tmp) goto defer;

	TCLI(makePostfields)(log);
	
	return ;

defer:
	TCLI(error)("json creation failed.");
}

typedef enum
{
	TCLI_GET	= 1 << 0,
	TCLI_POST	= 1 << 1,
	TCLI_PATCH	= 1 << 2,
	TCLI_DELETE = 1 << 3,
}	TCLI_reqtype;

typedef enum
{
	TCLI_REQ_LOGIN		= 1 << 4,
	TCLI_REQ_REGISTER	= 1 << 4,
}	TCLI_req;

typedef struct
{
	char		*data;
	uint32_t	len;
}	TCLI_buff;

TCLI_API(makeRequest)(uint16_t type)
{
	if (type & TCLI_REQ_LOGIN)
		TCLI(login)("caca", "12345678");

	if (type & TCLI_POST)
		curl_easy_setopt(CURL_CTX, CURLOPT_POSTFIELDS, TCLI_POSTFIELDS);
}

uint32_t	TCLI(curlCB)(void *ptr, uint32_t size, uint32_t nmemb, void *ud)
{
	uint32_t	total = size * nmemb;
	TCLI(buff)	*cb = ud;

	cb->data = realloc(cb->data, cb->len + total + 1);
	memcpy(cb->data + cb->len, ptr, total);
	cb->len += total;
	cb->data[cb->len] = 0;

	return (total);
}

# define	TCLI_REQUEST_FAILED	"[%s] Warning: http request failed with error code %d\n"

TCLI_API(sendRequest)(int *res)
{
	if (TCLI_POSTFIELDS)
		printf("postfieds = %s\n", TCLI_POSTFIELDS);

	curl_easy_setopt(CURL_CTX, CURLOPT_HTTPHEADER, TCLI_HDRS);
	curl_easy_setopt(CURL_CTX, CURLOPT_URL, TCLI_URL);

	*res = curl_easy_perform(CURL_CTX);
	if (res != CURLE_OK)
		printf(TCLI_REQUEST_FAILED, TCLI_EXE, *res);

	curl_slist_free_all(TCLI_HDRS);
	curl_easy_reset(CURL_CTX);
}

#endif	// _TRANSCENDENCE_H
