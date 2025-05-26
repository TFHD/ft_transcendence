/*
 *	CLI Transcendence application.
 */

#include <transcendence.h>

#define UNUSED	__attribute__((unused))

#define	TCLI_URL_BASE	"https://Trans/api/"

#define	AUTH_HEADER		"authorization: Bearer "

typedef enum e_cli_reqtype
{
	CLI_GET = 1,
	CLI_POST = 2,
	CLI_PATCH = 3,
	CLI_DELETE = 4,
}	cli_reqtype;

void	TCLI_loop(void)
{
	int res = 0;

    curl_easy_setopt(CURL_CTX, CURLOPT_WRITEFUNCTION, TCLI_curlCB);
    curl_easy_setopt(CURL_CTX, CURLOPT_WRITEDATA, &TCLI_CBSTR);

	TCLI_SceneCtx	*ctx	= NULL;
	TCLI_SCENE				= &TCLI_loginPage;
// 	TCLI_SCENE				= &TCLI_debugPage;
	TCLI_STATUS				|= TCLI_SCENE_SWAP;

	TCLI_Events events;
	TCLI_eventsInit(&events);

	memset(TCLI_WSBUF_SEND, 0, sizeof(TCLI_WSBUF_SEND));
	printf("Loop start\n");
	
	while (TCLI_ACTIVE)
	{
		if (TCLI_SCENE)
			ctx = TCLI_SCENE();
		if (TCLI_STATUS & TCLI_SCENE_SWAP)
		{
			TCLI_screenClear(&TCLI_SCREEN);
			TCLI_render(ctx);
			TCLI_STATUS &= ~TCLI_SCENE_SWAP;
			continue ;
		}

		TCLI_eventsHandle(ctx, &events);
		TCLI_screenClear(&TCLI_SCREEN);
		if (TCLI_STATUS & TCLI_PONG_GAME)
		{
			vec2 ballPos = (vec2){TCLI_CTX->ballX * (TCLI_WIDTH - 2), TCLI_CTX->ballY * TCLI_HEIGHT};
			
// 			printf("paddle floats at %f\n", TCLI_CTX->p1Y);

			vec2 p1Pos = (vec2){0, (TCLI_CTX->p1Y) * TCLI_HEIGHT - (TCLI_HEIGHT / 8 - 1.5)};
			vec2 p2Pos = (vec2){TCLI_WIDTH - 3, (TCLI_CTX->p2Y) * TCLI_HEIGHT - (TCLI_HEIGHT / 8 - 1.5)};
			vec2 paddleSize = (vec2){3, TCLI_HEIGHT / 4 - 2};

			TCLI_screenDrawSquare(&TCLI_SCREEN, (vec2){ballPos.x - 2, ballPos.y - 2},
				(vec2){4, 4}, 0xFFFFFF, 0);

// 			printf("paddle at %d %d\n", p1Pos.x, p1Pos.y);

			TCLI_screenDrawSquare(&TCLI_SCREEN, p1Pos, paddleSize, 0xFFFFFF, 0);
			TCLI_screenDrawSquare(&TCLI_SCREEN, p2Pos, paddleSize, 0xFFFFFF, 0);

		}
		TCLI_render(ctx);

#if 0
		write(STDOUT_FILENO, "\033[0;0f", 6);
		write(STDOUT_FILENO, TCLI_SCREEN.data,
			TCLI_SCREEN.width * TCLI_SCREEN.height * TCLI_CHAR_SIZE);
#endif
	}
	TCLI_eventsDestroy(&events);
}

int main(int argc, char **argv)
{
	TCLI_init(argc, argv);
	TCLI_loop();
	TCLI_cleanup();
}
