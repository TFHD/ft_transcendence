/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ui.c                                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rgramati <rgramati@42angouleme.fr>         +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/15 18:42:56 by rgramati          #+#    #+#             */
/*   Updated: 2025/05/17 20:51:44 by rgramati         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include <transcendence.h>

void	TCLI_FUNC(setSelectFuncs)(TCLI_Elem *elem, TCLI_Action in, TCLI_Action out)
{
	if (!elem)
		return ;
	if (in)
		elem->onSelect = in;
	if (out)
		elem->onDeselect = out;
}

TCLI_API(void, renderText)(TCLI_Elem *e)
{
	screen_drawText(
		&TCLI_SCREEN,
		e->txt, e->pos[TCLI_IDX_TEXT], e->colors[TCLI_IDX_TEXT]
	);
}

TCLI_API(void, renderTextbox)(TCLI_Elem *e)
{
	screen_drawSquare(
		&TCLI_SCREEN,
		e->pos[TCLI_IDX_BOX], e->size, e->colors[TCLI_IDX_BOX], 1
	);
	screen_drawText(
		&TCLI_SCREEN,
		e->txt, e->pos[TCLI_IDX_TEXT], e->colors[TCLI_IDX_TEXT]
	);
	screen_drawText(
		&TCLI_SCREEN,
		e->input, e->pos[TCLI_IDX_INPUT], e->colors[TCLI_IDX_INPUT]
	);
}

TCLI_API(void, renderButton)(TCLI_Elem *e)
{
	screen_drawSquare(
		&TCLI_SCREEN,
		e->pos[TCLI_IDX_BOX], e->size, e->colors[TCLI_IDX_BOX], 1
	);
	screen_drawText(
		&TCLI_SCREEN,
		e->txt, e->pos[TCLI_IDX_TEXT], e->colors[TCLI_IDX_TEXT]
	);
}

TCLI_API(void, renderImage)(TCLI_Elem *e)
{}

typedef void	(*TCLI_renderer)(TCLI_Elem *);

static const TCLI_renderer	_renderers[4] = 
{
	TCLI_FUNC(renderText),
	TCLI_FUNC(renderTextbox),
	TCLI_FUNC(renderButton),
	TCLI_FUNC(renderImage),
};

void	TCLI_FUNC(selectTextbox)(TCLI_ElemHdr *hdr)
{
	TCLI_Elem	*elem = (TCLI_Elem *)hdr;

	elem->colors[TCLI_IDX_BOX] = 0xDD1212;
}

void	TCLI_FUNC(selectButton)(TCLI_ElemHdr *hdr)
{
	TCLI_Elem	*elem = (TCLI_Elem *)hdr;

	elem->colors[TCLI_IDX_TEXT] = 0xDD1212;
}

static const	TCLI_Action	_selecters[4] = 
{
	NULL,
	TCLI_FUNC(selectTextbox),
	TCLI_FUNC(selectButton),
	NULL
};

void	TCLI_FUNC(deselectTextbox)(TCLI_ElemHdr *hdr)
{
	TCLI_Elem	*elem = (TCLI_Elem *)hdr;

	elem->colors[TCLI_IDX_BOX] = 0xc3c3c3;
}

void	TCLI_FUNC(deselectButton)(TCLI_ElemHdr *hdr)
{
	TCLI_Elem	*elem = (TCLI_Elem *)hdr;

	elem->colors[TCLI_IDX_TEXT] = 0xc3c3c3;
}

static const	TCLI_Action	_deselecters[4] = 
{
	NULL,
	TCLI_FUNC(deselectTextbox),
	TCLI_FUNC(deselectButton),
	NULL
};

void	TCLI_FUNC(render)(TCLI_SceneCtx *ctx)
{
	ctx->select->onSelect(&ctx->select->h);
	for (uint32_t i = 1; i < ctx->count; ++i)
	{
		TCLI_Elem	*curr = &ctx->elems[i];

		_renderers[curr->h.type](curr);
	}
}
void	TCLI_FUNC(rootElem)(TCLI_SceneCtx *ctx)
{
	memset(ctx->elems, 0xFF, sizeof(TCLI_Elem));
	ctx->count++;
}

TCLI_Elem	*TCLI_FUNC(newButton)
(TCLI_SceneCtx *ctx, const char *txt, vec2 pos, vec2 size, uint32_t txtColor, uint32_t boxColor)
{
	TCLI_Elem	*button = &ctx->elems[ctx->count];

	button->h = (TCLI_ElemHdr){.type = TCLI_ELEM_BUTTON};

	button->pos[TCLI_IDX_BOX] = pos;
	button->colors[TCLI_IDX_BOX] = boxColor;
	button->size = size;

	uint32_t	txtLen = strlen(txt);

	memcpy(button->txt, txt, txtLen);

	uint32_t	txtX = pos.x + (size.x - (txtLen * 4)) / 2 + 1;
	uint32_t	txtY = pos.y + (size.y - 5) / 2;

	button->pos[TCLI_IDX_TEXT] = (vec2){txtX, txtY};
	button->colors[TCLI_IDX_TEXT] = txtColor;

	TCLI_setSelectFuncs(
		button,
		_selecters[TCLI_ELEM_BUTTON],
		_deselecters[TCLI_ELEM_BUTTON]
	);
	ctx->count++;

	return (button);
}

TCLI_Elem	*TCLI_FUNC(newText)
(TCLI_SceneCtx *ctx, const char *txt, vec2 pos, uint32_t txtColor)
{
	TCLI_Elem	*text = &ctx->elems[ctx->count];

	text->h = (TCLI_ElemHdr){.type = TCLI_ELEM_TEXT};

	text->pos[TCLI_IDX_BOX] = pos;

	uint32_t	txtLen = strlen(txt);
	memcpy(text->txt, txt, txtLen);

	text->pos[TCLI_IDX_TEXT] = pos;
	text->colors[TCLI_IDX_TEXT] = txtColor;

	text->size = (vec2) {txtLen * 4, 6};

	ctx->count++;

	return (text);
}

TCLI_Elem	*TCLI_FUNC(newTextbox)
(TCLI_SceneCtx *ctx, const char *txt, vec2 pos, uint32_t txtColor)
{
	TCLI_Elem	*textbox = &ctx->elems[ctx->count];

	textbox->h = (TCLI_ElemHdr){.type = TCLI_ELEM_TEXTBOX};

	textbox->pos[TCLI_IDX_TEXT] = (vec2){pos.x + 2, pos.y + 2};
	textbox->colors[TCLI_IDX_BOX] = txtColor;
	textbox->colors[TCLI_IDX_TEXT] = txtColor;
	textbox->colors[TCLI_IDX_INPUT] = txtColor;
	
	uint32_t	txtLen = strlen(txt);
	memcpy(textbox->txt, txt, txtLen);

	textbox->size = (vec2) {16 * 4, 9};

	textbox->pos[TCLI_IDX_BOX] = (vec2){pos.x + txtLen * 4 + 1, pos.y};
	textbox->pos[TCLI_IDX_INPUT] = (vec2){pos.x + txtLen * 4 + 3, pos.y + 2};
	TCLI_setSelectFuncs(
		textbox,
		_selecters[TCLI_ELEM_TEXTBOX],
		_deselecters[TCLI_ELEM_TEXTBOX]
	);

	ctx->count++;
	
	return (textbox);
}

void	TCLI_FUNC(setPos)(TCLI_Elem *elem, uint8_t idx, vec2 pos)
{
	if (!elem || idx >= TCLI_IDX_LAST)
		return ;
	elem->pos[idx] = pos;
}

void	TCLI_FUNC(setColor)(TCLI_Elem *elem, uint8_t idx, uint32_t color)
{
	if (!elem || idx >= TCLI_IDX_LAST)
		return ;
	elem->colors[idx] = color;
}

void	TCLI_FUNC(setNext)(TCLI_Elem *elem, uint8_t idx, TCLI_Elem *next)
{
	if (!elem || idx >= TCLI_IDX_LAST)
		return ;
	elem->nexts[idx] = next;
}

void	TCLI_FUNC(setLink)(TCLI_Elem *elem, void *s)
{
	if (!elem)
		return;
	elem->slink = (TCLI_Scene)s;
}

