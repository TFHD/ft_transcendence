/**
 * ui.h
 */

#ifndef		_UI_H
# define	_UI_H

# include <types.h>
# include <screen.h>
# include <context.h>
# include <http.h>

# define	TCLI_ELEM_LAST ((void *)-1UL)

enum
{
	TCLI_IDX_BOX = 0,
	TCLI_IDX_TEXT = 1,
	TCLI_IDX_INPUT = 2,
	TCLI_IDX_DEFAULT = 3,
	TCLI_IDX_LAST = 4
};

enum
{
	TCLI_ELEM_TEXT = 0,
	TCLI_ELEM_TEXTBOX = 1,
	TCLI_ELEM_BUTTON = 2,
	TCLI_ELEM_IMAGE = 3,
};

enum
{
	TCLI_SCENE_LINK = 1 << 0,
	TCLI_SCENE_RELOAD = 1 << 1,
	TCLI_REQUEST_SEND = 1 << 2,
	TCLI_REQUEST_RECV = 1 << 3,
};

enum
{
	TCLI_ARROW_UP = 0,
	TCLI_ARROW_DOWN = 1,
	TCLI_ARROW_RIGHT = 2,
	TCLI_ARROW_LEFT = 3,
};

struct	_tcli_elemHdr
{
	uint32_t	type;
	uint32_t	flags;
};

struct	_tcli_action
{
	void		*func;
	void		*arg;
};

struct	_tcli_elem
{
	TCLI(ElemHdr)		h;
	struct _tcli_elem	*nexts[4];
	char				txt[16];
	char				input[16];
	uint32_t			*image;
	uint32_t			colors[4];
	vec2				pos[4];
	vec2				size;
	uint32_t			action;
	uint32_t			actionCount;
	TCLI(Action)		onSelect;
	TCLI(Action)		onDeselect;
};

struct	_tcli_sceneCtx
{
	TCLI(Elem)		elems[16];
	TCLI(Elem)		*select;
	TCLI(Elem)		*last;
	TCLI(Action)	actions[8];
	uint32_t		actionCount;
	uint32_t		elemCount;
};

TCLI_API(loadScene)
(void *toLoad);

TCLI_API(renderText)
(TCLI(Elem) *e);

TCLI_API(renderTextbox)
(TCLI(Elem) *e);

TCLI_API(renderButton)
(TCLI(Elem) *e);

TCLI_API(renderImage)
(TCLI(Elem) *e);

TCLI_API(render)
(TCLI(SceneCtx) *ctx);

TCLI_API(handleKey)
(TCLI(SceneCtx) *ctx, char key);

TCLI_API(rootElem)
(TCLI(SceneCtx) *ctx);

TCLI(Elem)	*TCLI(newText)
(TCLI(SceneCtx) *ctx, const char *txt, vec2 pos, uint32_t txtColor, uint32_t dftColor);

TCLI(Elem)	*TCLI(newTextbox)
(TCLI(SceneCtx) *ctx, const char *txt, vec2 pos, uint32_t txtColor);

TCLI(Elem)	*TCLI(newButton)
(
	TCLI(SceneCtx) *ctx,
	const char *txt,
	vec2 pos,
	vec2 size,
	uint32_t txtColor,
	uint32_t boxColor,
	uint32_t dftColor
);

TCLI(Elem)	*TCLI(newImage)
(TCLI(SceneCtx) *ctx, vec2 pos, vec2 size, uint32_t *image);

TCLI_API(select)
(TCLI(Elem) *elem);

TCLI_API(deselect)
(TCLI(Elem) *elem);

TCLI_API(setPos)
(TCLI(Elem) *elem, uint8_t idx, vec2 pos);

TCLI_API(setColor)
(TCLI(Elem) *elem, uint8_t idx, uint32_t color);

TCLI_API(setNext)
(TCLI(Elem) *elem, uint8_t idx, TCLI(Elem) *next);

TCLI_API(addAction)
(TCLI(SceneCtx) *ctx, TCLI(Elem) *to, TCLI(Action) what);

TCLI_API(setTextInvisible)
(TCLI(Elem) *elem);

TCLI_API(setTextVisible)
(TCLI(Elem) *elem);

#endif		// _UI_H
