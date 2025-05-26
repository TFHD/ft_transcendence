/**
 * ui.c
 */

#include <ui.h>

// TODO : Action queue ssystem for modularity

TCLI_API(loadScene)(void *toLoad)
{
	TCLI_SCENE = (TCLI_Scene)toLoad;
	TCLI_STATUS |= TCLI_SCENE_SWAP;
}

// TODO : add SELECT and DESELECT action pushes


TCLI_API(handleJump)(TCLI_SceneCtx *ctx, TCLI_ElemHdr *next)
{
	TCLI_Elem			*current = (TCLI_Elem *)ctx->select;

	if (current)
	{
		TCLI_Interactable	*inter = current->i;

		printf("current = %p -> trying to jump to %p\n", current, next);
		if (inter->onDeselect.func)
			TCLI_handleAction(ctx, &inter->onDeselect);
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

	if (current->i && current->i->onSelect.func)
		TCLI_handleAction(ctx, &current->i->onSelect);
}

TCLI_API(handleAction)(TCLI_SceneCtx *ctx, TCLI_Action *action)
{
	printf("Action HANDLING !!!\n");
	if (action->func == TCLI_handleJump)
	{
		printf("Element switch !!!\n");
		TCLI_ElemLoader		f = action->func;
		TCLI_ElemHdr		*a = action->arg;

		f(ctx, a);
		return ;
	}
	if (action->func == TCLI_loadScene)
	{
		printf("Scene loading !\n");
		TCLI_SceneLoader	f = action->func;
		TCLI_Scene			*a = action->arg;

		f(a);
		return ;
	}
	if (action->func == TCLI_makeRequest)
	{
		TCLI_Requester	f = action->func;
		uint64_t		a = (uint64_t) action->arg;

		f(ctx, a);
		return ;
	}
	if (action->func == TCLI_evalReply)
	{
		TCLI_Evaluer	f = action->func;
		uint64_t		a = (uint64_t) action->arg;

		f(a);
		return ;
	}
	printf("TCLI_Renderer  called !!!\n");
	TCLI_Renderer	f = action->func;
	TCLI_ElemHdr	*a = action->arg;
	f(a);
}

TCLI_INTERN(handleInput)(const TCLI_Elem *current, char key)
{
	char	*field = (char *)current->data;

	printf("field pointer = %p\n", field);

	if (current->h.type != TCLI_ELEM_TEXTBOX)
		return ;

	uint32_t	len = strlen(field);

	if (key == 127 && len > 0)
		field[len - 1] = 0;
	else if (len >= 15)
		return ;
	else if (key >= 32 && key < 127)
		field[len] = key;
}

TCLI_API(handleKey)(TCLI_SceneCtx *ctx, char key)
{
	const TCLI_Elem			*current = (TCLI_Elem *)ctx->select;
	const TCLI_Interactable	*inter = current->i;

	if (!inter)	return ;

	printf("Handling a keystroke ! -> %d\n", key);
	if (key == '\n')
	{
		printf("Enter actions -> %d to go...\n", inter->onEnterCount);
		for (uint32_t i = 0; i < inter->onEnterCount; ++i)
			TCLI_handleAction(ctx, &inter->onEnter[i]);
		return ;
	}

	printf("Not enter, checking for actions...");
	for (uint32_t i = 0; i < inter->onKeyCount; ++i)
	{
		TCLI_Action	*action = &inter->onKey[i];

		printf("action key = %d ", action->key);
		if (action->key == key)
		{
			printf(" == %d, calling handleAction\n", key);
			TCLI_handleAction(ctx, action);
			return ;
		}
		printf(" != %d...\n", key);
	}
	printf("handleInput called\n");
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
	printf("le rouge !\n");
	e->color = 0xF31313;
}

void	TCLI_deselectButton(TCLI_ElemHdr *hdr)
{
	TCLI_Elem	*e = (TCLI_Elem *)hdr;

	if (!e)
		return ;
	printf("retour au blanc\n");
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

	inter->onSelect = ACTION(selectors[hdr->type], e);
	inter->onDeselect = ACTION(selectors[TCLI_ELEM_LAST + hdr->type], e);
			
	uint32_t i;

	for (i = 0; onEnter[i].func; ++i) {}
	inter->onEnterCount = i;
	inter->onEnter = malloc(i * sizeof(TCLI_Action));
	memcpy(inter->onEnter, onEnter, i * sizeof(TCLI_Action));

	for (i = 0; onKey[i].func; ++i) {}
	inter->onKeyCount = i;
	inter->onKey = malloc(i * sizeof(TCLI_Action));
	memcpy(inter->onKey, onKey, i * sizeof(TCLI_Action));

	e->i = inter;
}
