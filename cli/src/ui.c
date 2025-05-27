/**
 * ui.c
 */

#include <ui.h>

// TODO : Action queue ssystem for modularity

TCLI_API(loadScene)(TCLI_SceneCtx *ctx, void *toLoad)
{
	(void) ctx;
	TCLI_SCENE = (TCLI_Scene)toLoad;
	TCLI_STATUS |= TCLI_SCENE_SWAP;
}

// TODO : add SELECT and DESELECT action pushes


TCLI_API(handleJump)(TCLI_SceneCtx *ctx, void *next)
{
	TCLI_Elem			*current = (TCLI_Elem *)ctx->select;

	if (current)
	{
		TCLI_Interactable	*inter = current->i;

		if (inter->onDeselect)
			inter->onDeselect((TCLI_ElemHdr *)current);
	}

	if (next == TCLI_ELEM_NULL)
	{
		if (!ctx->last)
			return ;
		ctx->select = ctx->last;
	}
	else
	{
		ctx->select = next;
	}

	ctx->last = (TCLI_ElemHdr *) current;
	current = (TCLI_Elem *) ctx->select;

	if (current->i && current->i->onSelect)
		current->i->onSelect((TCLI_ElemHdr *)current);
}

TCLI_INTERN(gameSettings)(TCLI_SceneCtx* ctx, void *arg)
{
	(void)	ctx;

	char	*mode = (char *)arg;

	strcpy(TCLI_GAME_INFO.mode, mode);
	TCLI_GAME_INFO.mode[strlen(mode)] = 0;
	if (*mode == 's')
		TCLI_STATUS |= TCLI_PONG_SOLO;
}

typedef void	(*TCLI_ActionHandler)(TCLI_SceneCtx *, void *);

TCLI_API(handleAction)(TCLI_SceneCtx *ctx, TCLI_Action *action)
{
	const TCLI_ActionHandler	handlers[7] = 
	{
		NULL,
		TCLI_handleJump,
		TCLI_loadScene,
		TCLI_makeRequest,
		TCLI_evalReply,
		TCLI_react,
		TCLI_gameSettings,
	};

	if (action->type && action->type < 7)
		handlers[action->type](ctx, action->arg);
}

TCLI_INTERN(handleInput)(const TCLI_Elem *current, char key)
{
	char	*field = (char *)current->data;

	if (current->h.type != TCLI_ELEM_TEXTBOX)
		return ;

	uint32_t	len = strlen(field);

	if (key == 127 && len > 0)
		field[len - 1] = 0;
	else if (len >= current->txtSize)
		return ;
	else if (key >= 32 && key < 127)
		field[len] = key;
}

TCLI_API(handleKey)(TCLI_SceneCtx *ctx, char key)
{
	const TCLI_Elem			*current = (TCLI_Elem *)ctx->select;

	if (current == (void *)1) return ;

	const TCLI_Interactable	*inter = current->i;

	if (!inter)	return ;

	if (key == '\n')
	{
		for (uint32_t i = 0; i < inter->onEnterCount; ++i)
		{
			if (TCLI_STATUS & TCLI_ACTION_SKIP)
			{
				TCLI_STATUS &= ~TCLI_ACTION_SKIP;
				continue ;
			}
			TCLI_handleAction(ctx, &inter->onEnter[i]);
		}
		return ;
	}

	for (uint32_t i = 0; i < inter->onKeyCount; ++i)
	{
		TCLI_Action	*action = &inter->onKey[i];

		if (action->key == key)
		{
			TCLI_handleAction(ctx, action);
			return ;
		}
	}
	TCLI_handleInput(current, key);
}

TCLI_API(renderImage)(TCLI_ElemHdr *hdr)
{
	TCLI_Elem		*e = (TCLI_Elem *)hdr;

	TCLI_screenDrawImg(&TCLI_SCREEN, e->t.pos, e->t.size, (uint32_t *)e->data);
}

TCLI_API(renderText)(TCLI_ElemHdr *hdr)
{
	TCLI_Elem	*e = (TCLI_Elem *)hdr;

	TCLI_screenDrawText(&TCLI_SCREEN, (char *)e->data, e->t.pos, e->color);
}

TCLI_API(renderTextbox)(TCLI_ElemHdr *hdr)
{
	TCLI_Elem	*e = (TCLI_Elem *)hdr;

	TCLI_screenDrawSquare(&TCLI_SCREEN, e->t.pos, e->t.size, e->color, 1);

	vec2	txtPos = (vec2){e->t.pos.x + 2, e->t.pos.y + 2};

	TCLI_screenDrawText(&TCLI_SCREEN, (char *)e->data, txtPos, e->color);
}

const TCLI_Renderer	_renderers[4] = 
{
	TCLI_renderText,
	TCLI_renderTextbox,
	TCLI_renderTextbox,
	TCLI_renderImage,
};

TCLI_API(render)(TCLI_SceneCtx *ctx)
{
	if (!ctx)
		return ;
	if (ctx->elemCount == 0)
		return ;
	for (uint32_t i = 0; i < ctx->elemCount; ++i)
	{
		TCLI_ElemHdr	*it = ctx->elems[i];

		_renderers[it->type](it);
	}
}

void	TCLI_selectButton(TCLI_ElemHdr *hdr)
{
	TCLI_Elem	*e = (TCLI_Elem *)hdr;

	if (!e)
		return ;
	e->color = 0xF31313;
}

void	TCLI_deselectButton(TCLI_ElemHdr *hdr)
{
	TCLI_Elem	*e = (TCLI_Elem *)hdr;

	if (!e)
		return ;
	e->color = e->colorD;
}

void	TCLI_selectTextbox(TCLI_ElemHdr *hdr)
{
	TCLI_Elem	*e = (TCLI_Elem *)hdr;

	if (!e)
		return ;
	e->color = 0xF31313;
}

void	TCLI_deselectTextbox(TCLI_ElemHdr *hdr)
{
	TCLI_Elem	*e = (TCLI_Elem *)hdr;

	if (!e)
		return ;
	e->color = e->colorD;
}

static const TCLI_Renderer	selectors[TCLI_ELEM_LAST * 2] = 
{
	[TCLI_ELEM_BUTTON] = TCLI_selectButton,
	[TCLI_ELEM_TEXTBOX] = TCLI_selectTextbox,

	[TCLI_ELEM_LAST + TCLI_ELEM_BUTTON] = TCLI_deselectButton,
	[TCLI_ELEM_LAST + TCLI_ELEM_TEXTBOX] = TCLI_deselectTextbox,
};

TCLI_API(makeInteractions)
(
	TCLI_ElemHdr *hdr,
	TCLI_Action *onEnter,
	TCLI_Action *onKey
)	{
	
	if (!hdr)
		return ;

	TCLI_Elem			*e = (TCLI_Elem *)hdr;
	TCLI_Interactable	*inter = e->i;

	if (!inter)
		inter = malloc(sizeof(TCLI_Interactable));
	if (!inter)
		return;

	inter->onSelect = selectors[hdr->type];
	inter->onDeselect = selectors[TCLI_ELEM_LAST + hdr->type];
			
	uint32_t i;

	for (i = 0; onEnter[i].type; ++i) {}
	inter->onEnterCount = i;
	inter->onEnter = malloc(i * sizeof(TCLI_Action));
	memcpy(inter->onEnter, onEnter, i * sizeof(TCLI_Action));

	for (i = 0; onKey[i].type; ++i) {}
	inter->onKeyCount = i;
	inter->onKey = malloc(i * sizeof(TCLI_Action));
	memcpy(inter->onKey, onKey, i * sizeof(TCLI_Action));

	e->i = inter;
}
