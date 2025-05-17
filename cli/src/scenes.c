/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   scenes.c                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rgramati <rgramati@42angouleme.fr>         +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/14 19:27:19 by rgramati          #+#    #+#             */
/*   Updated: 2025/05/17 20:54:50 by rgramati         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include <transcendence.h>

TCLI_SCENE_FUNC(loginPage)
{
	static TCLI_SceneCtx ctx = {0};
	if (ctx.count == 0)
	{
 		TCLI_rootElem(&ctx);

		TCLI_Elem	*_buttonBack = TCLI_newButton(
			&ctx, "< Back",
			(vec2) {1, TCLI_HEIGHT - 12},
			(vec2) {27, 11},
			0xc3c3c3, 0xc3c3c3
		);
		TCLI_setNext(_buttonBack, TCLI_ARROW_RIGHT, TCLI_ELEM_LAST);
		TCLI_setLink(_buttonBack, &TCLI_FUNC(mainMenu));
		
		ctx.select = _buttonBack;
	}
	return (&ctx);
}

TCLI_SCENE_FUNC(registerPage)
{
	static TCLI_SceneCtx ctx = {0};
	if (ctx.count == 0)
	{
 		TCLI_rootElem(&ctx);

		TCLI_Elem	*_buttonBack = TCLI_newButton(
			&ctx, "< Back",
			(vec2) {1, TCLI_HEIGHT - 12},
			(vec2) {27, 11},
			0xc3c3c3, 0xc3c3c3
		);
		TCLI_setLink(_buttonBack, &TCLI_FUNC(mainMenu));
		TCLI_setNext(_buttonBack, TCLI_ARROW_RIGHT, TCLI_ELEM_LAST);
		
		ctx.select = _buttonBack;
	}
	return (&ctx);
}

TCLI_SCENE_FUNC(settingsPage)
{
	static TCLI_SceneCtx ctx = {0};
	if (ctx.count == 0)
	{

	}
	return (&ctx);
}

TCLI_SCENE_FUNC(lobbyPage)
{
	static TCLI_SceneCtx ctx = {0};
	if (ctx.count == 0)
	{

	}
	return (&ctx);
}

TCLI_SCENE_FUNC(gamePage)
{
	static TCLI_SceneCtx ctx = {0};
	if (ctx.count == 0)
	{

	}
	return (&ctx);
}

TCLI_SCENE_FUNC(mainMenu)
{
	static TCLI_SceneCtx ctx = {0};

	if (ctx.count == 0)
	{
 		TCLI_rootElem(&ctx);

		TCLI_Elem	*_buttonLogin = TCLI_newButton(
			&ctx, "Login",
			(vec2) {TCLI_WIDTH / 2 - (TCLI_MENU_BTN_W / 2 + 1), TCLI_HEIGHT / 2 - 7},
			(vec2) {TCLI_MENU_BTN_W, 11},
			0xc3c3c3, 0xc3c3c3
		);
		TCLI_Elem	*_buttonRegister = TCLI_newButton(
			&ctx, "Register",
			(vec2) {TCLI_WIDTH / 2 - (TCLI_MENU_BTN_W / 2 + 1), TCLI_HEIGHT / 2 + 6},
			(vec2) {TCLI_MENU_BTN_W, 11},
			0xc3c3c3, 0xc3c3c3
		);
		TCLI_Elem	*_buttonQuit = TCLI_newButton(
			&ctx, "Quit",
			(vec2) {TCLI_WIDTH / 2 - (TCLI_MENU_BTN_W / 2 + 1), TCLI_HEIGHT / 2 + 19},
			(vec2) {TCLI_MENU_BTN_W, 11},
			0xc3c3c3, 0xc3c3c3
		);

		TCLI_setLink(_buttonLogin,		&TCLI_FUNC(loginPage));
		TCLI_setLink(_buttonRegister,	&TCLI_FUNC(registerPage));
		TCLI_setLink(_buttonQuit,		&TCLI_FUNC(quit));
		
		TCLI_setNext(_buttonLogin,		TCLI_ARROW_DOWN, _buttonRegister);
		TCLI_setNext(_buttonRegister,	TCLI_ARROW_DOWN, _buttonQuit);
		TCLI_setNext(_buttonRegister,	TCLI_ARROW_UP, _buttonLogin);
		TCLI_setNext(_buttonQuit,		TCLI_ARROW_UP, _buttonRegister);

		ctx.select = _buttonLogin;
	}
	return (&ctx);
}

TCLI_SCENE_FUNC(debugPage)
{
	static TCLI_SceneCtx ctx = {0};
	if (ctx.count == 0)
	{
		TCLI_rootElem(&ctx);

		TCLI_Elem	*_textboxUser = TCLI_newTextbox(&ctx, "USERNAME :", (vec2){10, 30}, 0xFFFFFFFF);
		TCLI_Elem	*_textboxPass = TCLI_newTextbox(&ctx, "PASSWORD :", (vec2){10, 42}, 0xFFFFFFFF);
		
		TCLI_setLink(_textboxUser, &TCLI_FUNC(mainMenu));
		TCLI_setLink(_textboxPass, &TCLI_FUNC(mainMenu));

		ctx.select = _textboxUser;
	}
	return (&ctx);
}

TCLI_SCENE_FUNC(quit)
{
	TCLI_STATUS &= ~TCLI_FLAG_OK;
	return (NULL);
}
