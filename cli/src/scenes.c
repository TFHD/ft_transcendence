/**
 * scenes.c
 */

#include <scenes.h>

#define	TRANSFORM(P, S)		(TCLI_Transform){.pos = P, .size = S}
#define	VEC2(X, Y)			(vec2){.x = (X), .y = (Y)}

TCLI_ElemHdr	*TCLI_newElem(TCLI_SceneCtx *ctx, uint32_t type, TCLI_Transform t, uint32_t color, void *data)
{
	if (!ctx)
		return (NULL);
	if (ctx->elemCount == ctx->elemSize)
		return (NULL);

	TCLI_Elem	*elem = malloc(sizeof(TCLI_Elem));

	*elem = (TCLI_Elem)
	{
		.h = (TCLI_ElemHdr) { .type = type},
		.t = t,
		.i = NULL,
		.color = color,
		.colorD = color,
		.txtSize = 0,
		.data = data
	};
	ctx->elems[ctx->elemCount] = (TCLI_ElemHdr *)elem;
	ctx->elemCount++;

	return ((TCLI_ElemHdr *)elem);
}

TCLI_INTERN(setTextSize)(TCLI_ElemHdr *hdr, uint32_t limit)
{
	TCLI_Elem	*elem = (TCLI_Elem *)hdr;

	elem->txtSize = limit;
}

TCLI_INTERN(gameReset)(void)
{
	for (uint32_t i = 0; i < TCLI_CTX->actionCount; ++i)
	{
		free(TCLI_CTX->actionQueue[i]);
		TCLI_CTX->actionQueue[i] = NULL;
	}
	TCLI_CTX->actionCount = 0;
	TCLI_GAME_INFO.p1name = NULL;
	TCLI_GAME_INFO.p2name = NULL;
	TCLI_STATUS &= ~(TCLI_PONG_GAME | TCLI_PONG_SOLO | TCLI_GAME_NAMED);
	TCLI_loadScene(NULL, &TCLI_settingsPage);
	free(TCLI_GAME_INFO.p1name);
	free(TCLI_GAME_INFO.p2name);
}

TCLI_SCENE_FUNC(loginPage)
{
	static TCLI_SceneCtx ctx = {0};
	if (!ctx.select)
	{
		TCLI_LogInfo *log = malloc(sizeof(TCLI_LogInfo));
		memset(log, 0, sizeof(TCLI_LogInfo));
		ctx.data = log;

		ctx.elems = malloc(7 * sizeof(TCLI_Elem *));
		ctx.elemSize = 7;
	
		TCLI_newElem
		(
			&ctx, TCLI_ELEM_TEXT,
			TRANSFORM(VEC2(3, 3), VEC2(43, 9)),
			0xC3C3C3, "username:"
		);
		TCLI_ElemHdr	*_textboxUser = TCLI_newElem
		(
			&ctx, TCLI_ELEM_TEXTBOX,
			TRANSFORM(VEC2(45, 1), VEC2(67, 9)),
			0xC3C3C3, log->username
		);
		TCLI_setTextSize(_textboxUser, 15);

		TCLI_newElem
		(
			&ctx, TCLI_ELEM_TEXT,
			TRANSFORM(VEC2(3, 13), VEC2(43, 9)),
			0xC3C3C3, "password:"
		);
		TCLI_ElemHdr	*_textboxPass = TCLI_newElem
		(
			&ctx, TCLI_ELEM_TEXTBOX,
			TRANSFORM(VEC2(45, 11), VEC2(67, 9)),
			0xC3C3C3, log->password
		);
		TCLI_setTextSize(_textboxPass, 15);

		TCLI_ElemHdr	*_buttonLogin = TCLI_newElem
		(
			&ctx, TCLI_ELEM_BUTTON,
			TRANSFORM(VEC2(1, 21), VEC2(40, 9)),
			0xC3C3C3, "Login"
		);

		TCLI_ElemHdr	*_buttonBack = TCLI_newElem
		(
			&ctx, TCLI_ELEM_BUTTON,
			TRANSFORM(VEC2(1, TCLI_HEIGHT - 10), VEC2(40, 9)),
			0xC3C3C3, "Back"
		);

		TCLI_ElemHdr	*_textError = TCLI_newElem
		(
			&ctx, TCLI_ELEM_TEXT,
			TRANSFORM(VEC2(3, 31), VEC2(0, 0)),
			0xF31313, NULL
		);

		TCLI_makeInteractions
		(
			_textboxUser,
			ACTION_LIST {
				ACTION(TCLI_ACTION_JUMP, _textboxPass),
				NOOP()
			},
			ACTION_LIST {
				KACTION(TCLI_ACTION_JUMP, _textboxPass, 9),
				KACTION(TCLI_ACTION_JUMP, _textboxPass, TCLI_ARROW_DOWN),
				KACTION(TCLI_ACTION_JUMP, _buttonBack, TCLI_ARROW_LEFT),
				NOOP()
			}
		);
		TCLI_makeInteractions
		(
			_textboxPass,
			ACTION_LIST {
				ACTION(TCLI_ACTION_JUMP, _buttonLogin),
				NOOP()
			},
			ACTION_LIST {
				KACTION(TCLI_ACTION_JUMP, _buttonLogin, 9),
				KACTION(TCLI_ACTION_JUMP, _textboxUser, TCLI_ARROW_UP),
				KACTION(TCLI_ACTION_JUMP, _buttonLogin, TCLI_ARROW_DOWN),
				KACTION(TCLI_ACTION_JUMP, _buttonBack, TCLI_ARROW_LEFT),
				NOOP()
			}
		);
		TCLI_makeInteractions
		(
			_buttonLogin,
			ACTION_LIST {
				ACTION(TCLI_ACTION_REQ, TCLI_DO_LOGIN),
				ACTION(TCLI_ACTION_EVAL, TCLI_DO_LOGIN),
				ACTION(TCLI_ACTION_REACT, _textError),
				ACTION(TCLI_ACTION_LOAD, &TCLI_settingsPage),
				NOOP()
			},
			ACTION_LIST {
				KACTION(TCLI_ACTION_JUMP, _textboxPass, TCLI_ARROW_UP),
				KACTION(TCLI_ACTION_JUMP, _buttonBack, TCLI_ARROW_LEFT),
				NOOP()
			}
		);
		TCLI_makeInteractions
		(
			_buttonBack,
			ACTION_LIST {
				ACTION(TCLI_ACTION_LOAD, &TCLI_mainMenu),
				NOOP()
			},
			ACTION_LIST {
				KACTION(TCLI_ACTION_JUMP, TCLI_ELEM_NULL, TCLI_ARROW_RIGHT),
				NOOP()
			}
		);
		ctx.select = _textboxUser;
	}
	return (&ctx);
}

TCLI_SCENE_FUNC(registerPage)
{
	static TCLI_SceneCtx ctx = {0};

	if (!ctx.select)
	{
		TCLI_LogInfo *log = malloc(sizeof(TCLI_LogInfo));
		memset(log, 0, sizeof(TCLI_LogInfo));
		ctx.data = log;

		ctx.elems = malloc(9 * sizeof(TCLI_Elem *));
		ctx.elemSize = 9;
	
		TCLI_newElem
		(
			&ctx, TCLI_ELEM_TEXT,
			TRANSFORM(VEC2(3, 3), VEC2(43, 9)),
			0xC3C3C3, "username:"
		);
		TCLI_ElemHdr	*_textboxUser = TCLI_newElem
		(
			&ctx, TCLI_ELEM_TEXTBOX,
			TRANSFORM(VEC2(45, 1), VEC2(67, 9)),
			0xC3C3C3, log->username
		);
		TCLI_setTextSize(_textboxUser, 15);

		TCLI_newElem
		(
			&ctx, TCLI_ELEM_TEXT,
			TRANSFORM(VEC2(3, 13), VEC2(43, 9)),
			0xC3C3C3, "   email:"
		);
		TCLI_ElemHdr	*_textboxMail = TCLI_newElem
		(
			&ctx, TCLI_ELEM_TEXTBOX,
			TRANSFORM(VEC2(45, 11), VEC2(67, 9)),
			0xC3C3C3, log->email
		);
		TCLI_setTextSize(_textboxMail, 15);

		TCLI_newElem
		(
			&ctx, TCLI_ELEM_TEXT,
			TRANSFORM(VEC2(3, 23), VEC2(43, 9)),
			0xC3C3C3, "password:"
		);
		TCLI_ElemHdr	*_textboxPass = TCLI_newElem
		(
			&ctx, TCLI_ELEM_TEXTBOX,
			TRANSFORM(VEC2(45, 21), VEC2(67, 9)),
			0xC3C3C3, log->password
		);
		TCLI_setTextSize(_textboxPass, 15);

		TCLI_ElemHdr	*_buttonRegister = TCLI_newElem
		(
			&ctx, TCLI_ELEM_BUTTON,
			TRANSFORM(VEC2(1, 31), VEC2(40, 9)),
			0xC3C3C3, "Register"
		);

		TCLI_ElemHdr	*_buttonBack = TCLI_newElem
		(
			&ctx, TCLI_ELEM_BUTTON,
			TRANSFORM(VEC2(1, TCLI_HEIGHT - 10), VEC2(40, 9)),
			0xC3C3C3, "Back"
		);

		TCLI_ElemHdr	*_textError = TCLI_newElem
		(
			&ctx, TCLI_ELEM_TEXT,
			TRANSFORM(VEC2(2, 43), VEC2(0, 0)),
			0xF31313, NULL
		);

		TCLI_makeInteractions
		(
			_textboxUser,
			ACTION_LIST {
				ACTION(TCLI_ACTION_JUMP,	_textboxPass),
				NOOP()
			},
			ACTION_LIST {
				KACTION(TCLI_ACTION_JUMP,	_textboxMail, 9),
				KACTION(TCLI_ACTION_JUMP, 	_textboxMail, TCLI_ARROW_DOWN),
				KACTION(TCLI_ACTION_JUMP, 	_buttonBack, TCLI_ARROW_LEFT),
				NOOP()
			}
		);
		TCLI_makeInteractions
		(
			_textboxMail,
			ACTION_LIST {
				ACTION(TCLI_ACTION_JUMP,	_textboxPass),
				NOOP()
			},
			ACTION_LIST {
				KACTION(TCLI_ACTION_JUMP,	_textboxPass, 9),
				KACTION(TCLI_ACTION_JUMP, 	_textboxUser, TCLI_ARROW_UP),
				KACTION(TCLI_ACTION_JUMP, 	_textboxPass, TCLI_ARROW_DOWN),
				KACTION(TCLI_ACTION_JUMP, 	_buttonBack, TCLI_ARROW_LEFT),
				NOOP()
			}
		);
		TCLI_makeInteractions
		(
			_textboxPass,
			ACTION_LIST {
				ACTION(TCLI_ACTION_JUMP,	_buttonRegister),
				NOOP()
			},
			ACTION_LIST {
				KACTION(TCLI_ACTION_JUMP,	_textboxMail, TCLI_ARROW_UP),
				KACTION(TCLI_ACTION_JUMP, 	_buttonRegister, TCLI_ARROW_DOWN),
				KACTION(TCLI_ACTION_JUMP, 	_buttonBack, TCLI_ARROW_LEFT),
				KACTION(TCLI_ACTION_JUMP, 	_buttonRegister, 9),
				NOOP()
			}
		);
		TCLI_makeInteractions
		(
			_buttonRegister,
			ACTION_LIST {
				ACTION(TCLI_ACTION_REQ,		TCLI_DO_REGISTER),
				ACTION(TCLI_ACTION_EVAL,	TCLI_DO_REGISTER),
				ACTION(TCLI_ACTION_REACT,	_textError),
				ACTION(TCLI_ACTION_LOAD,	&TCLI_loginPage),
				NOOP()
			},
			ACTION_LIST {
				KACTION(TCLI_ACTION_JUMP,	_textboxPass, TCLI_ARROW_UP),
				KACTION(TCLI_ACTION_JUMP, 	_buttonBack, TCLI_ARROW_LEFT),
				NOOP()
			}
		);
		TCLI_makeInteractions
		(
			_buttonBack,
			ACTION_LIST {
				ACTION(TCLI_ACTION_LOAD,	&TCLI_mainMenu),
				NOOP()
			},
			ACTION_LIST {
				KACTION(TCLI_ACTION_JUMP,	TCLI_ELEM_NULL, TCLI_ARROW_RIGHT),
				NOOP()
			}
		);

		ctx.select = _textboxUser;
	}
	return (&ctx);
}

# define	TCLI_MENU_BTN_W		55

TCLI_SCENE_FUNC(settingsPage)
{
	static TCLI_SceneCtx ctx = {0};

	if (!ctx.select)
	{
		ctx.data = &TCLI_GAME_INFO;

		ctx.elems = malloc(6 * sizeof(TCLI_Elem *));
		ctx.elemSize = 6;
	
		TCLI_ElemHdr	*_buttonSolo = TCLI_newElem
		(
			&ctx, TCLI_ELEM_BUTTON,
			TRANSFORM(VEC2(1, 1), VEC2(40, 9)),
			0xC3C3C3, "Solo"
		);

		TCLI_ElemHdr	*_buttonPractice = TCLI_newElem
		(
			&ctx, TCLI_ELEM_BUTTON,
			TRANSFORM(VEC2(1, 11), VEC2(40, 9)),
			0xC3C3C3, "Practice"
		);

		TCLI_ElemHdr	*_buttonMulti = TCLI_newElem
		(
			&ctx, TCLI_ELEM_BUTTON,
			TRANSFORM(VEC2(1, 21), VEC2(40, 9)),
			0xC3C3C3, "Multi"
		);

		TCLI_ElemHdr	*_buttonLogout = TCLI_newElem
		(
			&ctx, TCLI_ELEM_BUTTON,
			TRANSFORM(VEC2(1, 41), VEC2(40, 9)),
			0xC3C3C3, "Logout"
		);

		TCLI_newElem
		(
			&ctx, TCLI_ELEM_TEXT,
			TRANSFORM(VEC2(3, 33), VEC2(0, 0)),
			0xC3C3C3, "room ID:"
		);
		TCLI_ElemHdr	*_textboxID = TCLI_newElem
		(
			&ctx, TCLI_ELEM_TEXTBOX,
			TRANSFORM(VEC2(45, 31), VEC2(27, 9)),
			0xC3C3C3, &TCLI_GAME_INFO.roomid
		);
		TCLI_setTextSize(_textboxID, 6);

		TCLI_makeInteractions
		(
			_buttonSolo,
			ACTION_LIST {
				ACTION(TCLI_ACTION_SETTINGS, "solo"),
 				ACTION(TCLI_ACTION_LOAD, &TCLI_gamePage),
				NOOP()
			},
			ACTION_LIST {
				KACTION(TCLI_ACTION_JUMP, _buttonPractice, 9),
				KACTION(TCLI_ACTION_JUMP, _buttonPractice, TCLI_ARROW_DOWN),
				NOOP()
			}
		);

		TCLI_makeInteractions
		(
			_buttonPractice,
			ACTION_LIST {
				ACTION(TCLI_ACTION_SETTINGS, "practice"),
 				ACTION(TCLI_ACTION_LOAD, &TCLI_gamePage),
				NOOP()
			},
			ACTION_LIST {
				KACTION(TCLI_ACTION_JUMP, _buttonMulti, 9),
				KACTION(TCLI_ACTION_JUMP, _buttonMulti, TCLI_ARROW_DOWN),
				KACTION(TCLI_ACTION_JUMP, _buttonSolo, TCLI_ARROW_UP),
				NOOP()
			}
		);
		
		TCLI_makeInteractions
		(
			_buttonMulti,
			ACTION_LIST {
				ACTION(TCLI_ACTION_SETTINGS, "duo"),
 				ACTION(TCLI_ACTION_LOAD, &TCLI_gamePage),
				NOOP()
			},
			ACTION_LIST {
				KACTION(TCLI_ACTION_JUMP, _textboxID, 9),
				KACTION(TCLI_ACTION_JUMP, _textboxID, TCLI_ARROW_DOWN),
				KACTION(TCLI_ACTION_JUMP, _buttonPractice, TCLI_ARROW_UP),
				NOOP()
			}
		);

		TCLI_makeInteractions
		(
			_textboxID,
			ACTION_LIST {
				ACTION(TCLI_ACTION_JUMP, _buttonMulti),
				NOOP()
			},
			ACTION_LIST {
				KACTION(TCLI_ACTION_JUMP, _buttonLogout, 9),
				KACTION(TCLI_ACTION_JUMP, _buttonLogout, TCLI_ARROW_DOWN),
				KACTION(TCLI_ACTION_JUMP, _buttonMulti, TCLI_ARROW_UP),
				NOOP()
			}
		);

		TCLI_makeInteractions
		(
			_buttonLogout,
			ACTION_LIST {
				ACTION(TCLI_ACTION_REQ, (void *)TCLI_DO_LOGOUT),
				ACTION(TCLI_ACTION_EVAL, (void *)TCLI_DO_LOGOUT),
				ACTION(TCLI_ACTION_LOAD, &TCLI_mainMenu),
				NOOP()
			},
			ACTION_LIST {
				KACTION(TCLI_ACTION_JUMP, _textboxID, TCLI_ARROW_UP),
				NOOP()
			}
		);

		ctx.select = _buttonSolo;
	}
	return (&ctx);
}

TCLI_SCENE_FUNC(gamePage)
{
	static TCLI_SceneCtx	ctx = {0};
	static CURLM			*multi;
	static CURL				*ws_handle;
	static int				running = 1;
	static struct curl_slist *hdrs = NULL;
	int fds = 0;

	if (!ctx.select)
	{
		TCLI_STATUS |= TCLI_PONG_GAME;
		multi = curl_multi_init();
		ws_handle = curl_easy_init();
		
   		//curl_easy_setopt(ws_handle,  CURLOPT_VERBOSE, 1L);
 		curl_easy_setopt(ws_handle,  CURLOPT_TIMEOUT, 10L);
		
		curl_easy_setopt(ws_handle, CURLOPT_CAINFO, TCLI_CERT_PATH);
		curl_easy_setopt(ws_handle, CURLOPT_SSL_VERIFYPEER, 1L);
		curl_easy_setopt(ws_handle, CURLOPT_SSL_VERIFYHOST, 2L);
		curl_easy_setopt(ws_handle, CURLOPT_UPKEEP_INTERVAL_MS, 30000L);
 	
		char	*lecookie = NULL;
		TCLI_getCookie(&lecookie);

		sprintf(TCLI_TMP, "Cookie: token=%s", lecookie);

		hdrs = curl_slist_append(hdrs, TCLI_TMP);
		curl_easy_setopt(ws_handle, CURLOPT_HTTPHEADER, hdrs);

		curl_easy_setopt(ws_handle, CURLOPT_COOKIEFILE, TCLI_COOKIE_FILE);
		curl_easy_setopt(ws_handle, CURLOPT_COOKIEJAR, TCLI_COOKIE_FP);
		
		curl_easy_setopt(ws_handle, CURLOPT_RESOLVE, TCLI_RESOLVE);

		TCLI_makeGameUrl(&TCLI_GAME_INFO);
		curl_easy_setopt(ws_handle, CURLOPT_URL, TCLI_URL);

		curl_easy_setopt(ws_handle, CURLOPT_CONNECT_ONLY,  2L);

		curl_multi_add_handle(multi, ws_handle);
		if (curl_multi_perform(multi, &running) != CURLM_OK)
			goto defer;

		ctx.select = (void *)1; 
	}

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
			break ;
		if (meta->flags & CURLWS_TEXT)
		{
			cJSON	*reply = cJSON_Parse(TCLI_WSBUF_RECV);

			cJSON	*stop = cJSON_GetObjectItemCaseSensitive(reply, "shouldStop");
			if (stop)
			{
				if (cJSON_IsBool(stop) && cJSON_IsTrue(stop))
				{
					cJSON_Delete(reply);
					goto defer;
				}
			}

			if (!(TCLI_STATUS & TCLI_GAME_NAMED))
			{
				cJSON *p1nameJ = cJSON_GetObjectItemCaseSensitive(reply, "player1Name");
				cJSON *p2nameJ = cJSON_GetObjectItemCaseSensitive(reply, "player2Name");

				TCLI_GAME_INFO.p1name = strdup(p1nameJ->valuestring);
				TCLI_GAME_INFO.p2name = strdup(p2nameJ->valuestring);

				TCLI_STATUS |= TCLI_GAME_NAMED;
			}

			cJSON *ballXJ = cJSON_GetObjectItemCaseSensitive(reply, "ballX");
			cJSON *ballYJ = cJSON_GetObjectItemCaseSensitive(reply, "ballY");
			cJSON *p1YJ = cJSON_GetObjectItemCaseSensitive(reply, "player1Y");
			cJSON *p2YJ = cJSON_GetObjectItemCaseSensitive(reply, "player2Y");
			cJSON *score1J = cJSON_GetObjectItemCaseSensitive(reply, "player1Score");
			cJSON *score2J = cJSON_GetObjectItemCaseSensitive(reply, "player2Score");

			if (!ballXJ || !ballYJ || !p1YJ || !p2YJ)
				break ;

			TCLI_CTX->ballX = (ballXJ->valuedouble);
			TCLI_CTX->ballY = 1 - (ballYJ->valuedouble);
			TCLI_CTX->p1Y = 1 - (p1YJ->valuedouble);
			TCLI_CTX->p2Y = 1 - (p2YJ->valuedouble);
			TCLI_CTX->score1 = (score1J->valueint);
			TCLI_CTX->score2 = (score2J->valueint);
			
			cJSON_Delete(reply);
		}
	}
	while (TCLI_CTX->actionCount)
	{
		size_t	nsent;

		char	*packet = TCLI_CTX->actionQueue[--TCLI_CTX->actionCount];

		if (curl_ws_send(ws_handle, packet, strlen(packet), &nsent, 0, CURLWS_TEXT) != CURLE_OK)
		{
			free(packet);
			goto defer;
		}
		free(packet);
	}

	return (&ctx);

defer:
	curl_multi_remove_handle(multi, ws_handle);
	curl_multi_cleanup(multi);
	curl_easy_cleanup(ws_handle);
	curl_slist_free_all(hdrs);
	TCLI_gameReset();
	ctx.select = NULL;
	hdrs = NULL;
	return (&ctx);
}

TCLI_SCENE_FUNC(mainMenu)
{
	static TCLI_SceneCtx ctx = {0};

	if (!ctx.select)
	{
		ctx.elems = malloc(3 * sizeof(TCLI_Elem *));
		ctx.elemSize = 3;
		
		TCLI_ElemHdr	*_buttonLogin = TCLI_newElem
		(
			&ctx, TCLI_ELEM_BUTTON,
			TRANSFORM(VEC2(1, 1), VEC2(40, 9)),
			0xC3C3C3, "Login"
		);
		TCLI_ElemHdr	*_buttonRegister = TCLI_newElem
		(
			&ctx, TCLI_ELEM_BUTTON,
			TRANSFORM(VEC2(1, 11), VEC2(40, 9)),
			0xC3C3C3, "Register"
		);
		TCLI_ElemHdr	*_buttonQuit = TCLI_newElem
		(
			&ctx, TCLI_ELEM_BUTTON,
			TRANSFORM(VEC2(1, 21), VEC2(40, 9)),
			0xC3C3C3, "Quit"
		);

		TCLI_makeInteractions
		(
			_buttonLogin,
			ACTION_LIST {
				ACTION(TCLI_ACTION_LOAD, &TCLI_loginPage),
				NOOP()
			},
			ACTION_LIST {
				KACTION(TCLI_ACTION_JUMP, _buttonRegister, TCLI_ARROW_DOWN),
				KACTION(TCLI_ACTION_JUMP, _buttonRegister, 9),
				NOOP()
			}
		);
		TCLI_makeInteractions
		(
			_buttonRegister,
			ACTION_LIST {
				ACTION(TCLI_ACTION_LOAD, &TCLI_registerPage),
				NOOP()
			},
			ACTION_LIST {
				KACTION(TCLI_ACTION_JUMP, _buttonLogin, TCLI_ARROW_UP),
				KACTION(TCLI_ACTION_JUMP, _buttonQuit, TCLI_ARROW_DOWN),
				KACTION(TCLI_ACTION_JUMP, _buttonQuit, 9),
				NOOP()
			}
		);
		TCLI_makeInteractions
		(
			_buttonQuit,
			ACTION_LIST {
				ACTION(TCLI_ACTION_LOAD, &TCLI_quit),
				NOOP()
			},
			ACTION_LIST {
				KACTION(TCLI_ACTION_JUMP, _buttonRegister, TCLI_ARROW_UP),
				NOOP()
			}
		);

		TCLI_handleAction(&ctx, &ACTION(TCLI_ACTION_JUMP, _buttonLogin));
	}
	return (&ctx);
}

TCLI_SCENE_FUNC(quit)
{
	TCLI_STATUS &= ~TCLI_FLAG_OK;
	return (NULL);
}
