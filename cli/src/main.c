/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.c                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rgramati <rgramati@42angouleme.fr>         +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/27 21:52:20 by rgramati          #+#    #+#             */
/*   Updated: 2025/05/27 22:17:49 by rgramati         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

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

void	TCLI_sceneDestroyOne(TCLI_SceneCtx *ctx)
{
	if (!ctx)
		return ;
	for (uint32_t i = 0; i < ctx->elemCount; ++i)
	{
		TCLI_Elem			*current = (TCLI_Elem *)ctx->elems[i];
		TCLI_Interactable	*inter = current->i;

		if (inter)
		{
			free(inter->onEnter);
			free(inter->onKey);
		}
		free(inter);
		free(current);
	}
	free(ctx->elems);
	if (ctx->data != &TCLI_GAME_INFO)
		free(ctx->data);
}

#define	SCENE_MAX	5

void	TCLI_scenesDestroy(void)
{
	TCLI_Scene	scenes[SCENE_MAX] = 
	{
		&TCLI_mainMenu,
		&TCLI_loginPage,
		&TCLI_registerPage,
		&TCLI_settingsPage,
		&TCLI_quit,
	};

	for (uint32_t i = 0; i < SCENE_MAX; ++i)
		TCLI_sceneDestroyOne(scenes[i]());
}

char	*TCLI_createPacket(char keychar)
{
	char	packet[64] = {0};

	memset(packet, 0, strlen(packet));
	strcat(packet, "{\"key\":\"");
	switch (keychar)
	{
		case 'w':				packet[strlen(packet)] = 'w'; break ;
		case 's':				packet[strlen(packet)] = 's'; break ;
		case TCLI_ARROW_UP:		strcat(packet, "ArrowUp"); break ;
		case TCLI_ARROW_DOWN:	strcat(packet, "ArrowDown"); break ;
	}
	if (TCLI_KEYMAP[(int)keychar])
		strcat(packet, "\",\"state\":true}");
	else
		strcat(packet, "\",\"state\":false}");
	return strdup(packet);
}

void	TCLI_sendGamePacket(void)
{
	char	keys[4] = {'w', 's', TCLI_ARROW_UP, TCLI_ARROW_DOWN};

	for (uint32_t i = 0; i < 4; ++i)
	{
		if (TCLI_CTX->actionCount >= sizeof(TCLI_CTX->actionQueue) / sizeof(char *))
			return ;
		char	*packet = TCLI_createPacket(keys[i]);

		TCLI_CTX->actionQueue[TCLI_CTX->actionCount++] = packet;
	}
}

void	TCLI_updateGame(void)
{
	vec2 ballPos = (vec2){TCLI_CTX->ballX * (TCLI_WIDTH - 2), TCLI_CTX->ballY * (TCLI_HEIGHT - 12) + 12};
	vec2 p1Pos = (vec2){0, (TCLI_CTX->p1Y) * (TCLI_HEIGHT - 12) - ((TCLI_HEIGHT - 12) / 8 - 2) + 12};
	vec2 p2Pos = (vec2){TCLI_WIDTH - 3, (TCLI_CTX->p2Y) * (TCLI_HEIGHT - 12) - ((TCLI_HEIGHT - 12) / 8 - 2) + 12};
	vec2 paddleSize = (vec2){3, (TCLI_HEIGHT - 12) / 4 - 2};

	TCLI_screenDrawSquare(&TCLI_SCREEN, (vec2){ballPos.x, ballPos.y - 1}, (vec2){3, 3}, 0xFFFFFF, 0);

	TCLI_screenDrawSquare(&TCLI_SCREEN, p1Pos, paddleSize, 0xFFFFFF, 0);
	TCLI_screenDrawSquare(&TCLI_SCREEN, p2Pos, paddleSize, 0xFFFFFF, 0);
	TCLI_screenDrawLine(&TCLI_SCREEN, (vec2){TCLI_WIDTH / 2, 0}, (vec2){TCLI_WIDTH / 2, TCLI_HEIGHT}, 0xFFFFFF);
	TCLI_screenDrawLine(&TCLI_SCREEN, (vec2){0, 10}, (vec2){TCLI_WIDTH, 10}, 0xFFFFFF);

	char	score[4] = {TCLI_CTX->score1 + 48, 0, TCLI_CTX->score2 + 48, 0};

	dprintf(2, "names = {%s, %s}\n", TCLI_GAME_INFO.p1name, TCLI_GAME_INFO.p2name);

	TCLI_screenDrawText(&TCLI_SCREEN, &score[0], (vec2){TCLI_WIDTH / 2 - 5, 3}, 0xFFFFFF);
	if (TCLI_GAME_INFO.p1name)
		TCLI_screenDrawText(&TCLI_SCREEN, TCLI_GAME_INFO.p1name, (vec2){7, 3}, 0xFFFFFF);
	TCLI_screenDrawText(&TCLI_SCREEN, &score[2], (vec2){TCLI_WIDTH / 2 + 3, 3}, 0xFFFFFF);
	if (TCLI_GAME_INFO.p2name)
		TCLI_screenDrawText(&TCLI_SCREEN, TCLI_GAME_INFO.p2name, (vec2){TCLI_WIDTH - 8 - (strlen(TCLI_GAME_INFO.p2name) * 4), 3}, 0xFFFFFF);
}

void	TCLI_loop(void)
{
    curl_easy_setopt(CURL_CTX, CURLOPT_WRITEFUNCTION, TCLI_curlCB);
    curl_easy_setopt(CURL_CTX, CURLOPT_WRITEDATA, &TCLI_CBSTR);

	TCLI_SceneCtx	*ctx	= NULL;
	TCLI_SCENE				= &TCLI_mainMenu;
	TCLI_STATUS				|= TCLI_SCENE_SWAP;

	TCLI_Events events;
	TCLI_eventsInit(&events);

	memset(TCLI_WSBUF_SEND, 0, sizeof(TCLI_WSBUF_SEND));
	
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
			TCLI_sendGamePacket();
			TCLI_updateGame();
		}
		TCLI_render(ctx);

#if 1
		write(STDOUT_FILENO, "\033[0;0f", 6);
		write(STDOUT_FILENO, TCLI_SCREEN.data,
			TCLI_SCREEN.width * TCLI_SCREEN.height * TCLI_CHAR_SIZE);
#endif

	}
	TCLI_eventsDestroy(&events);
	TCLI_scenesDestroy();
}

int main(int argc, char **argv)
{
	TCLI_init(argc, argv);
	TCLI_loop();
	TCLI_cleanup();
}
