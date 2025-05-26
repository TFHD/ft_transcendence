/**
 * scenes.c
 */

#include <scenes.h>

TCLI_SCENE_FUNC(loginPage)
{
	static TCLI_SceneCtx ctx = {0};
	if (ctx.elemCount == 0)
	{
 		TCLI_rootElem(&ctx);

		TCLI_Elem	*_buttonBack = TCLI_newButton(
			&ctx, "< Back",
			(vec2) {1, TCLI_HEIGHT - 12},
			(vec2) {27, 11},
			0xc3c3c3, 0xc3c3c3, 0xc3c3c3
		);
		TCLI_Elem	*_buttonLogin = TCLI_newButton(
			&ctx, " Login ",
			(vec2) {TCLI_WIDTH / 2 - 17, 65},
			(vec2) {37, 11},
			0xc3c3c3, 0xc3c3c3, 0xc3c3c3
		);
		TCLI_Elem	*_textboxUser = TCLI_newTextbox(&ctx, "Username: ", (vec2){50, 30}, (vec2){64, 11}, 0xFFFFFFFF);
		TCLI_Elem	*_textboxPass = TCLI_newTextbox(&ctx, "Password: ", (vec2){50, 42}, (vec2){64, 11}, 0xFFFFFFFF);

		TCLI_Elem	*_textError = TCLI_newText(&ctx, "LOGIN FAILED !", (vec2){52, 54}, 0, 0xf21212);
		TCLI_setTextInvisible(_textError);

		TCLI_setNext(_buttonBack, TCLI_ARROW_RIGHT, TCLI_ELEM_LAST);
		TCLI_setNext(_buttonLogin, TCLI_ARROW_UP,		_textboxPass);
		TCLI_setNext(_buttonLogin, TCLI_ARROW_LEFT,	_buttonBack);
		TCLI_setNext(_textboxUser, TCLI_ARROW_DOWN,	_textboxPass);
		TCLI_setNext(_textboxUser, TCLI_ARROW_LEFT,	_buttonBack);
		TCLI_setNext(_textboxPass, TCLI_ARROW_UP,		_textboxUser);
		TCLI_setNext(_textboxPass, TCLI_ARROW_DOWN,	_buttonLogin);
		TCLI_setNext(_textboxPass, TCLI_ARROW_LEFT,	_buttonBack);

		TCLI_addAction(&ctx, _buttonBack, (TCLI_Action){TCLI_loadScene, &TCLI_mainMenu});

		TCLI_addAction(&ctx, _buttonLogin, (TCLI_Action){TCLI_makeRequest, (void *)TCLI_DO_LOGIN});
		TCLI_addAction(&ctx, _buttonLogin, (TCLI_Action){TCLI_evalReply, (void *)TCLI_DO_LOGIN});
		TCLI_addAction(&ctx, _buttonLogin, (TCLI_Action){(void *)TCLI_ACTION_SKIP, NULL});
		TCLI_addAction(&ctx, _buttonLogin, (TCLI_Action){TCLI_loadScene, &TCLI_settingsPage});
		TCLI_addAction(&ctx, _buttonLogin, (TCLI_Action){TCLI_setTextVisible, _textError});

		ctx.select = _textboxUser;
		((TCLI_Renderer)(ctx.select->onSelect.func))(ctx.select->onSelect.arg);
	}
	return (&ctx);
}

TCLI_SCENE_FUNC(registerPage)
{
	static TCLI_SceneCtx ctx = {0};
	if (ctx.elemCount == 0)
	{
 		TCLI_rootElem(&ctx);

		TCLI_Elem	*_buttonBack = TCLI_newButton(
			&ctx, "< Back",
			(vec2) {1, TCLI_HEIGHT - 12},
			(vec2) {27, 11},
			0xc3c3c3, 0xc3c3c3, 0xc3c3c3
		);
		TCLI_Elem	*_buttonRegister = TCLI_newButton(
			&ctx, " Register ",
			(vec2) {TCLI_WIDTH / 2 - 21, 65},
			(vec2) {42, 11},
			0xc3c3c3, 0xc3c3c3, 0xc3c3c3
		);
		TCLI_Elem	*_textboxUser = TCLI_newTextbox(&ctx, "Username: ", (vec2){50, 30}, (vec2){64, 11}, 0xFFFFFFFF);
		TCLI_Elem	*_textboxPass = TCLI_newTextbox(&ctx, "Password: ", (vec2){50, 42}, (vec2){64, 11}, 0xFFFFFFFF);
		TCLI_Elem	*_textboxConf = TCLI_newTextbox(&ctx, "Confirm : ", (vec2){50, 42}, (vec2){64, 11}, 0xFFFFFFFF);

		TCLI_Elem	*_textError = TCLI_newText(&ctx, "LOGIN FAILED !", (vec2){52, 54}, 0, 0xf21212);
		TCLI_setTextInvisible(_textError);

		TCLI_setNext(_buttonBack,		TCLI_ARROW_RIGHT,	TCLI_ELEM_LAST);
		TCLI_setNext(_buttonRegister,	TCLI_ARROW_UP,		_textboxPass);
		TCLI_setNext(_buttonRegister,	TCLI_ARROW_LEFT,	_buttonBack);

		TCLI_setNext(_textboxUser,		TCLI_ARROW_DOWN,	_textboxPass);
		TCLI_setNext(_textboxUser,		TCLI_ARROW_LEFT,	_buttonBack);
		TCLI_setNext(_textboxPass, 	TCLI_ARROW_UP,		_textboxUser);
		TCLI_setNext(_textboxPass, 	TCLI_ARROW_DOWN,	_textboxConf);
		TCLI_setNext(_textboxPass, 	TCLI_ARROW_LEFT,	_buttonBack);
		TCLI_setNext(_textboxConf, 	TCLI_ARROW_UP,		_textboxPass);
		TCLI_setNext(_textboxConf, 	TCLI_ARROW_DOWN,	_buttonRegister);
		TCLI_setNext(_textboxConf, 	TCLI_ARROW_LEFT,	_buttonBack);

		TCLI_addAction(&ctx, _buttonBack, (TCLI_Action){TCLI_loadScene, &TCLI_mainMenu});

// 		TCLI_addAction(&ctx, _buttonRegister, (TCLI_Action){TCLI_makeRequest, (void *)TCLI_DO_LOGIN});
// 		TCLI_addAction(&ctx, _buttonRegister, (TCLI_Action){TCLI_evalReply, (void *)TCLI_DO_LOGIN});
// 		TCLI_addAction(&ctx, _buttonRegister, (TCLI_Action){(void *)TCLI_ACTION_SKIP, NULL});
// 		TCLI_addAction(&ctx, _buttonRegister, (TCLI_Action){TCLI_loadScene, &TCLI_settingsPage});
// 		TCLI_addAction(&ctx, _buttonRegister, (TCLI_Action){TCLI_setTextVisible, _textError});
// 
		ctx.select = _textboxUser;
		((TCLI_Renderer)(ctx.select->onSelect.func))(ctx.select->onSelect.arg);
	}
	return (&ctx);
}

# define	TCLI_MENU_BTN_W		55

TCLI_SCENE_FUNC(settingsPage)
{
	static TCLI_SceneCtx ctx = {0};
	if (ctx.elemCount == 0)
	{
	 	TCLI_rootElem(&ctx);

		TCLI_Elem	*_buttonSolo = TCLI_newButton(
			&ctx, "Solo",
			(vec2) {55, 30},
			(vec2) {TCLI_MENU_BTN_W, 11},
			0xc3c3c3, 0xc3c3c3, 0xc3c3c3
		);
		TCLI_Elem	*_buttonPractice = TCLI_newButton(
			&ctx, "Practice",
			(vec2) {55, 42},
			(vec2) {TCLI_MENU_BTN_W, 11},
			0xc3c3c3, 0xc3c3c3, 0xc3c3c3
		);
		TCLI_Elem	*_buttonMulti = TCLI_newButton(
			&ctx, "Multi",
			(vec2) {55, 54},
			(vec2) {TCLI_MENU_BTN_W, 11},
			0xc3c3c3, 0xc3c3c3, 0xc3c3c3
		);
		TCLI_Elem	*_buttonLogout = TCLI_newButton(
			&ctx, "Logout",
			(vec2) {55, 68},
			(vec2) {TCLI_MENU_BTN_W, 11},
			0xc3c3c3, 0xc3c3c3, 0xc3c3c3
		);

		TCLI_addAction(&ctx, _buttonSolo, (TCLI_Action){TCLI_loadScene, &TCLI_gamePage});

		TCLI_setNext(_buttonSolo, TCLI_ARROW_DOWN, _buttonPractice);
		TCLI_setNext(_buttonPractice, TCLI_ARROW_UP, _buttonSolo);
		TCLI_setNext(_buttonPractice, TCLI_ARROW_DOWN, _buttonMulti);
		TCLI_setNext(_buttonMulti, TCLI_ARROW_UP, _buttonPractice);
		TCLI_setNext(_buttonMulti, TCLI_ARROW_DOWN, _buttonLogout);
		TCLI_setNext(_buttonLogout, TCLI_ARROW_UP, _buttonMulti);

		ctx.select = _buttonSolo;
		((TCLI_Renderer)(ctx.select->onSelect.func))(ctx.select->onSelect.arg);
	}
	return (&ctx);
}

TCLI_SCENE_FUNC(lobbyPage)
{
	static TCLI_SceneCtx ctx = {0};
	if (ctx.elemCount == 0)
	{

	}
	return (&ctx);
}

#define	WS_COOKIE	"Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ODUwODA5NDU4NzAxLCJpYXQiOjE3NDgxOTI0NDIsImV4cCI6MTc0ODIyODQ0Mn0.9m5Y5AVsnpW1nH0sglaYr4Gw-d7viX3JjUHYqxrvh04"

TCLI_SCENE_FUNC(gamePage)
{
	static TCLI_SceneCtx	ctx = {0};
	static CURLM			*multi;
	static CURL				*ws_handle;
	static int				running = 1;
	static struct curl_slist *hdrs = NULL;

	if (ctx.elemCount == 0)
	{
		TCLI_STATUS |= TCLI_PONG_GAME;
	 	TCLI_rootElem(&ctx);
		multi = curl_multi_init();
		ws_handle = curl_easy_init();
		
//   		curl_easy_setopt(ws_handle,  CURLOPT_VERBOSE, 1L);
 		curl_easy_setopt(ws_handle,  CURLOPT_TIMEOUT, 10L);
		
		curl_easy_setopt(ws_handle, CURLOPT_CAINFO, TCLI_CERT_PATH);
		curl_easy_setopt(ws_handle, CURLOPT_SSL_VERIFYPEER, 1L);
		curl_easy_setopt(ws_handle, CURLOPT_SSL_VERIFYHOST, 2L);
		curl_easy_setopt(ws_handle, CURLOPT_UPKEEP_INTERVAL_MS, 30000L);
 	
		hdrs = curl_slist_append(hdrs, WS_COOKIE);
		curl_easy_setopt(ws_handle, CURLOPT_HTTPHEADER, hdrs);
		
		curl_easy_setopt(ws_handle, CURLOPT_COOKIEFILE, "");
		curl_easy_setopt(ws_handle, CURLOPT_COOKIEJAR, TCLI_COOKIE_FP);
		
		curl_easy_setopt(ws_handle, CURLOPT_RESOLVE, TCLI_RESOLVE);

		curl_easy_setopt(ws_handle, CURLOPT_URL, TCLI_WSS_UPGRADE);
		TCLI_STATUS |= TCLI_PONG_SOLO;
		curl_easy_setopt(ws_handle, CURLOPT_CONNECT_ONLY,  2L);

		curl_multi_add_handle(multi, ws_handle);
		if (curl_multi_perform(multi, &running) != CURLM_OK)
			goto defer;

		printf("setup of multi handle\n");

		ctx.select = &ctx.elems[0];
	}

	int fds = 0;
	if (curl_multi_wait(multi, NULL, 0, 500, &fds) != CURLM_OK)
		goto defer;
    curl_multi_perform(multi, &running);

	while (1)
	{
		uint64_t					nread = 0;
		const struct curl_ws_frame	*meta;

		CURLcode	rc = curl_ws_recv(ws_handle, TCLI_WSBUF_RECV, 1024, &nread, &meta);

		if (rc == CURLE_AGAIN)
			break ;
		if (rc != CURLE_OK)
		{
// 			TCLI_STATUS &= ~TCLI_FLAG_OK;
			break ;
		}
		if (meta->flags & CURLWS_TEXT)
		{
			cJSON	*reply = cJSON_Parse(TCLI_WSBUF_RECV);

			cJSON	*stop = cJSON_GetObjectItemCaseSensitive(reply, "shouldStop");
			if (stop)
			{
				if (cJSON_IsBool(stop) && cJSON_IsTrue(stop))
				{
					cJSON_Delete(reply);
					curl_multi_remove_handle(multi, ws_handle);
					curl_multi_cleanup(multi);
					curl_easy_cleanup(ws_handle);
					ctx.elemCount = 0;
					memset(TCLI_WSBUF_SEND, 0, strlen(TCLI_WSBUF_SEND));
					TCLI_loadScene(&TCLI_settingsPage);
					TCLI_STATUS &= ~TCLI_PONG_GAME;
					curl_slist_free_all(hdrs);
					return (&ctx);
				}
			}

			cJSON *ballXJ = cJSON_GetObjectItemCaseSensitive(reply, "ballX");
			cJSON *ballYJ = cJSON_GetObjectItemCaseSensitive(reply, "ballY");
			cJSON *p1YJ = cJSON_GetObjectItemCaseSensitive(reply, "player1Y");
			cJSON *p2YJ = cJSON_GetObjectItemCaseSensitive(reply, "player2Y");

			if (!ballXJ || !ballYJ || !p1YJ || !p2YJ)
				break ;

			TCLI_CTX->ballX = (ballXJ->valuedouble);
			TCLI_CTX->ballY = 1 - (ballYJ->valuedouble);
			TCLI_CTX->p1Y = 1 - (p1YJ->valuedouble);
			TCLI_CTX->p2Y = 1 - (p2YJ->valuedouble);
			
			cJSON_Delete(reply);
		}
	}
// 	TCLI_handleWsFrames();
// 	TCLI_sendWsFrame();
	size_t to_send = strlen(TCLI_WSBUF_SEND);

	if(to_send > 0)
	{
		size_t nsent;
		if (curl_ws_send(ws_handle, TCLI_WSBUF_SEND, to_send, &nsent, 0, CURLWS_TEXT) == CURLE_OK)
		{
			memset(TCLI_WSBUF_SEND, 0, nsent);
		}
		else
		{
			printf("failed to send [%s]\n", TCLI_WSBUF_SEND);
			goto defer;
		}
	}

	return (&ctx);

defer:
	curl_multi_remove_handle(multi, ws_handle);
	curl_multi_cleanup(multi);
	curl_easy_cleanup(ws_handle);
	ctx.elemCount = 0;
	memset(TCLI_WSBUF_SEND, 0, strlen(TCLI_WSBUF_SEND));
	TCLI_STATUS &= ~TCLI_PONG_GAME;
	curl_slist_free_all(hdrs);
	return (NULL);
}

TCLI_SCENE_FUNC(mainMenu)
{
	static TCLI_SceneCtx ctx = {0};

	if (ctx.elemCount == 0)
	{
 		TCLI_rootElem(&ctx);

		TCLI_Elem	*_buttonLogin = TCLI_newButton(
			&ctx, "Login",
			(vec2) {TCLI_WIDTH / 2 - (TCLI_MENU_BTN_W / 2 + 1), TCLI_HEIGHT / 2 - 7},
			(vec2) {TCLI_MENU_BTN_W, 11},
			0xc3c3c3, 0xc3c3c3, 0xc3c3c3
		);
		TCLI_Elem	*_buttonRegister = TCLI_newButton(
			&ctx, "Register",
			(vec2) {TCLI_WIDTH / 2 - (TCLI_MENU_BTN_W / 2 + 1), TCLI_HEIGHT / 2 + 6},
			(vec2) {TCLI_MENU_BTN_W, 11},
			0xc3c3c3, 0xc3c3c3, 0xc3c3c3
		);
		TCLI_Elem	*_buttonQuit = TCLI_newButton(
			&ctx, "Quit",
			(vec2) {TCLI_WIDTH / 2 - (TCLI_MENU_BTN_W / 2 + 1), TCLI_HEIGHT / 2 + 19},
			(vec2) {TCLI_MENU_BTN_W, 11},
			0xc3c3c3, 0xc3c3c3, 0xc3c3c3
		);

		TCLI_setNext(_buttonLogin,		TCLI_ARROW_DOWN, _buttonRegister);
		TCLI_setNext(_buttonRegister,	TCLI_ARROW_DOWN, _buttonQuit);
		TCLI_setNext(_buttonRegister,	TCLI_ARROW_UP, _buttonLogin);
		TCLI_setNext(_buttonQuit,		TCLI_ARROW_UP, _buttonRegister);

		TCLI_addAction(&ctx, _buttonLogin, (TCLI_Action){TCLI_loadScene, &TCLI_loginPage});
		TCLI_addAction(&ctx, _buttonRegister, (TCLI_Action){TCLI_loadScene, &TCLI_registerPage});
		TCLI_addAction(&ctx, _buttonQuit, (TCLI_Action){TCLI_loadScene, &TCLI_quit});
		
		ctx.select = _buttonLogin;
		((TCLI_Renderer)(ctx.select->onSelect.func))(ctx.select->onSelect.arg);
	}
	return (&ctx);
}

TCLI_API(displayQR)(void *arg)
{
	(void) arg;

	printf("%s called !\n", __func__);

}

TCLI_SCENE_FUNC(debugPage)
{
	static TCLI_SceneCtx ctx = {0};
	if (ctx.elemCount == 0)
	{
		TCLI_rootElem(&ctx);

		TCLI_Elem	*_buttonQR = TCLI_newButton(
			&ctx, "Generate",
			(vec2) {1, 1},
			(vec2) {35, 11},
			0xc3c3c3, 0xc3c3c3, 0xc3c3c3
		);

		TCLI_Elem	*_textbox2FA = TCLI_newTextbox(&ctx, "2FA:", (vec2){50, 30}, (vec2){27, 11}, 0xFFFFFFFF);

		TCLI_setNext(_buttonQR, TCLI_ARROW_RIGHT, _textbox2FA);
		TCLI_setNext(_textbox2FA, TCLI_ARROW_LEFT, _buttonQR);

		TCLI_addAction(&ctx, _buttonQR, (TCLI_Action){TCLI_makeRequest, (void *)TCLI_DO_QR});
		TCLI_addAction(&ctx, _buttonQR, (TCLI_Action){TCLI_evalReply, (void *)TCLI_DO_QR});
		TCLI_addAction(&ctx, _buttonQR, (TCLI_Action){(void *)TCLI_ACTION_SKIP, (void *)1});
		TCLI_addAction(&ctx, _buttonQR, (TCLI_Action){(void *)TCLI_ACTION_SKIP, (void *)1});
		TCLI_addAction(&ctx, _buttonQR, (TCLI_Action){TCLI_displayQR, NULL});

		ctx.select = _buttonQR;
		((TCLI_Renderer)(ctx.select->onSelect.func))(ctx.select->onSelect.arg);
	}
	return (&ctx);
}

TCLI_SCENE_FUNC(quit)
{
	TCLI_STATUS &= ~TCLI_FLAG_OK;
	return (NULL);
}
