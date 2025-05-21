/**
 * ui.c
 */

#include <ui.h>

// TODO : Action queue ssystem for modularity

TCLI_API(loadScene)(void *toLoad)
{
	TCLI_SCENE = (TCLI(Scene))toLoad;
	TCLI_STATUS |= TCLI_SCENE_SWAP;
}

TCLI_INTERN(handleAction)(TCLI(SceneCtx) *ctx)
{
	TCLI(Elem)		*current = ctx->select;
	TCLI(Action)	*actions = &ctx->actions[current->action];

	for (uint32_t i = 0; i < current->actionCount; ++actions, ++i)
	{
		printf("Action %d:%p   --   status = %16lx\n", i, actions->func, TCLI_STATUS);
		if (actions->func == TCLI(loadScene))
		{
			printf("  Loading scene...\n");
			TCLI(SceneLoader)	f = actions->func;
			TCLI(Scene)			*a = actions->arg;

			f(a);
			break ;
		}
		if (actions->func == TCLI(makeRequest))
		{
			printf("  HTTP Request...\n");
			TCLI(Requester)	f = actions->func;
			uint64_t		a = (uint64_t) actions->arg;

			f(ctx, a);
			continue ;
		}
		if (actions->func == TCLI(evalReply))
		{
			printf("  Evaluating reply...\n");
			TCLI(Evaluer)	f = actions->func;
			uint64_t		a = (uint64_t) actions->arg;

			f(a);
			continue ;
		}
		if (actions->func == (void *) 1)
		{
			printf("  Skipped an Action...\n");
			if (!(TCLI_STATUS & TCLI_REPLY))
			{
				actions++;
				i++;
			}
			continue ;
		}
		printf("  Rendering change...\n");
		TCLI(Renderer)	f = actions->func;
		TCLI(Elem)		*a = actions->arg;

		f(a);
	}
}

// TODO : add SELECT and DESELECT action pushes

TCLI_INTERN(handleJump)(TCLI(SceneCtx) *ctx, char key)
{
	TCLI(Elem)	*current = ctx->select;
	TCLI(Elem)	*next = current->nexts[(int)key];

	if (!next)
		return ;

	if (current->onDeselect.func)
		((TCLI(Renderer))(current->onDeselect.func))(current->onDeselect.arg);
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
	current = ctx->select;
	if (current->onSelect.func)
		((TCLI(Renderer))(current->onSelect.func))(current->onSelect.arg);
}

TCLI_INTERN(handleInput)(TCLI(Elem) *current, char key)
{
	if (current->h.type == TCLI_ELEM_TEXTBOX)
	{
		uint32_t	len = strlen(current->input);
		
		if (len >= 15)
			return ;
		if (key == 127 && len > 0)
			current->input[len - 1] = 0;
		else if (key >= 32 && key < 127)
			current->input[len] = key;
	}
}

TCLI_API(handleKey)(TCLI(SceneCtx) *ctx, char key)
{
	if (key < 4)
		TCLI(handleJump)(ctx, key);
	else if (key == '\n')
		TCLI(handleAction)(ctx);
	else
		TCLI(handleInput)(ctx->select, key);
}

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
	for (uint32_t i = 1; i < ctx->elemCount; ++i)
	{
		TCLI(Elem)	*curr = &ctx->elems[i];

		_renderers[curr->h.type](curr);
	}
}

TCLI_API(rootElem)(TCLI(SceneCtx) *ctx)
{
	memset(ctx->elems, 0xFF, sizeof(TCLI(Elem)));
	ctx->elemCount++;
}

TCLI_INTERN(selectButton)(TCLI(Elem) *button)
{
	button->colors[TCLI_IDX_TEXT] = 0xf21212;
}

TCLI_INTERN(deselectButton)(TCLI(Elem) *button)
{
	button->colors[TCLI_IDX_TEXT] = 0xc3c3c3;
}

TCLI(Elem)	*TCLI(newButton)
(TCLI(SceneCtx) *ctx, const char *txt, vec2 pos, vec2 size, uint32_t txtColor, uint32_t boxColor, uint32_t dftColor)
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
	button->colors[TCLI_IDX_DEFAULT] = dftColor;

	button->onSelect = (TCLI(Action)){TCLI(selectButton), button};
	button->onDeselect = (TCLI(Action)){TCLI(deselectButton), button};
	
	button->action = -1U;

	ctx->elemCount++;

	return (button);
}

TCLI(Elem)	*TCLI(newText)
(TCLI(SceneCtx) *ctx, const char *txt, vec2 pos, uint32_t txtColor, uint32_t dftColor)
{
	TCLI(Elem)	*text = &ctx->elems[ctx->elemCount];

	text->h = (TCLI(ElemHdr)){.type = TCLI_ELEM_TEXT};

	text->pos[TCLI_IDX_BOX] = pos;

	uint32_t	txtLen = strlen(txt);
	memcpy(text->txt, txt, txtLen);

	text->pos[TCLI_IDX_TEXT] = pos;
	text->colors[TCLI_IDX_TEXT] = txtColor;
	text->colors[TCLI_IDX_DEFAULT] = dftColor;

	text->size = (vec2) {txtLen * 4, 6};

	text->action = -1U;

	ctx->elemCount++;

	return (text);
}

TCLI_INTERN(selectTextbox)(TCLI(Elem) *textbox)
{
	textbox->colors[TCLI_IDX_TEXT] = 0xf21212;
	textbox->colors[TCLI_IDX_BOX] = 0xf21212;
}

TCLI_INTERN(deselectTextbox)(TCLI(Elem) *textbox)
{
	textbox->colors[TCLI_IDX_TEXT] = textbox->colors[TCLI_IDX_DEFAULT];
	textbox->colors[TCLI_IDX_BOX] = textbox->colors[TCLI_IDX_DEFAULT];
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
	textbox->colors[TCLI_IDX_DEFAULT] = txtColor;
	
	uint32_t	txtLen = strlen(txt);
	memcpy(textbox->txt, txt, txtLen);

	textbox->size = (vec2) {16 * 4, 9};

	textbox->pos[TCLI_IDX_BOX] = (vec2){pos.x + txtLen * 4 + 1, pos.y};
	textbox->pos[TCLI_IDX_INPUT] = (vec2){pos.x + txtLen * 4 + 3, pos.y + 2};

	textbox->onSelect = (TCLI(Action)){TCLI(selectTextbox), textbox};
	textbox->onDeselect = (TCLI(Action)){TCLI(deselectTextbox), textbox};

	textbox->action = -1U;

	ctx->elemCount++;
	
	return (textbox);
}

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

TCLI_API(setTextInvisible)(TCLI(Elem) *elem)
{
	if (!elem)
		return ;
	elem->colors[TCLI_IDX_TEXT] = 0;
}

TCLI_API(setTextVisible)(TCLI(Elem) *elem)
{
	if (!elem)
		return ;
	elem->colors[TCLI_IDX_TEXT] = elem->colors[TCLI_IDX_DEFAULT];
}

TCLI_API(addAction)(TCLI(SceneCtx) *ctx, TCLI(Elem) *to, TCLI(Action) what)
{
	if (to->action == -1U)
		to->action = ctx->actionCount;

	ctx->actions[ctx->actionCount] = what;
	ctx->actionCount++;
	to->actionCount++;
}
