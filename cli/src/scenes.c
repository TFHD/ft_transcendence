/**
 * scenes.c
 */

#include <scenes.h>

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
			0xc3c3c3, 0xc3c3c3, 0xc3c3c3
		);
		TCLI(Elem)	*_buttonLogin = TCLI_newButton(
			&ctx, " Login ",
			(vec2) {TCLI_WIDTH / 2 - 17, 70},
			(vec2) {37, 11},
			0xc3c3c3, 0xc3c3c3, 0xc3c3c3
		);
		TCLI(Elem)	*_textboxUser = TCLI(newTextbox)(&ctx, "Username : ", (vec2){67, 30}, 0xFFFFFFFF);
		TCLI(Elem)	*_textboxPass = TCLI(newTextbox)(&ctx, "Password : ", (vec2){67, 42}, 0xFFFFFFFF);

		TCLI(Elem)	*_textError = TCLI(newText)(&ctx, "LOGIN FAILED !", (vec2){67, 54}, 0, 0xf21212);
		TCLI(setTextInvisible)(_textError);

		TCLI(setNext)(_buttonBack, TCLI_ARROW_RIGHT, TCLI_ELEM_LAST);
		TCLI(setNext)(_buttonLogin, TCLI_ARROW_UP,		_textboxPass);
		TCLI(setNext)(_buttonLogin, TCLI_ARROW_LEFT,	_buttonBack);
		TCLI(setNext)(_textboxUser, TCLI_ARROW_DOWN,	_textboxPass);
		TCLI(setNext)(_textboxUser, TCLI_ARROW_LEFT,	_buttonBack);
		TCLI(setNext)(_textboxPass, TCLI_ARROW_UP,		_textboxUser);
		TCLI(setNext)(_textboxPass, TCLI_ARROW_DOWN,	_buttonLogin);
		TCLI(setNext)(_textboxPass, TCLI_ARROW_LEFT,	_buttonBack);

		TCLI(addAction)(&ctx, _buttonBack, (TCLI(Action)){TCLI(loadScene), &TCLI(mainMenu)});

		TCLI(addAction)(&ctx, _buttonLogin, (TCLI(Action)){TCLI(makeRequest), (void *)TCLI_DO_LOGIN});
		TCLI(addAction)(&ctx, _buttonLogin, (TCLI(Action)){TCLI(evalReply), (void *)TCLI_DO_LOGIN});
		TCLI(addAction)(&ctx, _buttonLogin, (TCLI(Action)){(void *)TCLI_ACTION_SKIP, NULL});
		TCLI(addAction)(&ctx, _buttonLogin, (TCLI(Action)){TCLI(loadScene), &TCLI(settingsPage)});
		TCLI(addAction)(&ctx, _buttonLogin, (TCLI(Action)){TCLI(setTextVisible), _textError});

		ctx.select = _textboxUser;
		((TCLI(Renderer))(ctx.select->onSelect.func))(ctx.select->onSelect.arg);
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
			0xc3c3c3, 0xc3c3c3, 0xc3c3c3
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
		TCLI(rootElem)(&ctx);
	
		ctx.select = &ctx.elems[0];
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
			0xc3c3c3, 0xc3c3c3, 0xc3c3c3
		);
		TCLI(Elem)	*_buttonRegister = TCLI_newButton(
			&ctx, "Register",
			(vec2) {TCLI_WIDTH / 2 - (TCLI_MENU_BTN_W / 2 + 1), TCLI_HEIGHT / 2 + 6},
			(vec2) {TCLI_MENU_BTN_W, 11},
			0xc3c3c3, 0xc3c3c3, 0xc3c3c3
		);
		TCLI(Elem)	*_buttonQuit = TCLI_newButton(
			&ctx, "Quit",
			(vec2) {TCLI_WIDTH / 2 - (TCLI_MENU_BTN_W / 2 + 1), TCLI_HEIGHT / 2 + 19},
			(vec2) {TCLI_MENU_BTN_W, 11},
			0xc3c3c3, 0xc3c3c3, 0xc3c3c3
		);

		TCLI(setNext)(_buttonLogin,		TCLI_ARROW_DOWN, _buttonRegister);
		TCLI(setNext)(_buttonRegister,	TCLI_ARROW_DOWN, _buttonQuit);
		TCLI(setNext)(_buttonRegister,	TCLI_ARROW_UP, _buttonLogin);
		TCLI(setNext)(_buttonQuit,		TCLI_ARROW_UP, _buttonRegister);

		TCLI(addAction)(&ctx, _buttonLogin, (TCLI(Action)){TCLI(loadScene), &TCLI(loginPage)});
		TCLI(addAction)(&ctx, _buttonRegister, (TCLI(Action)){TCLI(loadScene), &TCLI(registerPage)});
		TCLI(addAction)(&ctx, _buttonQuit, (TCLI(Action)){TCLI(loadScene), &TCLI(quit)});
		
		ctx.select = _buttonLogin;
		((TCLI(Renderer))(ctx.select->onSelect.func))(ctx.select->onSelect.arg);
	}
	return (&ctx);
}

TCLI_SCENE_FUNC(debugPage)
{
	static TCLI(SceneCtx) ctx = {0};
	if (ctx.elemCount == 0)
	{
		TCLI(rootElem)(&ctx);
	}
	return (&ctx);
}

TCLI_SCENE_FUNC(quit)
{
	TCLI_STATUS &= ~TCLI_FLAG_OK;
	return (NULL);
}
