/**
 * ui.h
 */

#ifndef		_UI_H
# define	_UI_H

# include <types.h>
# include <screen.h>
# include <context.h>
# include <http.h>

# define	TCLI_ELEM_NULL ((void *)-1UL)

# define	KACTION(T, A, K)	(TCLI_Action){.type = T, .arg = (void *)A, .key = K}
# define	ACTION(T, A)		KACTION(T, A, -1)
# define	NOOP()				KACTION(0, NULL, -1)
# define	ACTION_LIST			(TCLI_Action[])

enum
{
	TCLI_ELEM_TEXT = 0,
	TCLI_ELEM_TEXTBOX = 1,
	TCLI_ELEM_BUTTON = 2,
	TCLI_ELEM_IMAGE = 3,

	TCLI_ELEM_LAST = 4
};

enum
{
	TCLI_ACTION_JUMP		= 1,
	TCLI_ACTION_LOAD		= 2,
	TCLI_ACTION_REQ			= 3,
	TCLI_ACTION_EVAL		= 4,
	TCLI_ACTION_REACT		= 5,
	TCLI_ACTION_SETTINGS	= 6,
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
	void		*arg;
	uint32_t	type;
	int32_t		key;
};

struct	_tcli_interactable
{
	TCLI_Renderer	onSelect;
	TCLI_Renderer	onDeselect;
	TCLI_Action		*onEnter;
	TCLI_Action		*onKey;
	uint32_t		onEnterCount;
	uint32_t		onKeyCount;
};

struct	_tcli_transform
{
	vec2	pos;
	vec2	size;
};

struct	_tcli_elem
{
	TCLI_ElemHdr		h;
	TCLI_Transform		t;
	TCLI_Interactable	*i;
	uint32_t			color;
	uint32_t			colorD;
	uint32_t			txtSize;;
	void				*data;
};

struct	_tcli_loginfo
{
	char	username[16];
	char	password[16];
	char	email[32];
	char	twoFa[7];
	char	_reserved;
};

struct	_tcli_sceneCtx
{
	TCLI_ElemHdr	**elems;
	TCLI_ElemHdr	*select;
	TCLI_ElemHdr	*last;
	void			*data;
	uint32_t		elemCount;
	uint32_t		elemSize;
};

TCLI_API(loadScene)
(TCLI_SceneCtx *ctx, void *toLoad);

TCLI_API(renderText)
(TCLI_ElemHdr *e);

TCLI_API(renderTextbox)
(TCLI_ElemHdr *e);

TCLI_API(renderButton)
(TCLI_ElemHdr *e);

TCLI_API(renderImage)
(TCLI_ElemHdr *e);

TCLI_API(render)
(TCLI_SceneCtx *ctx);

TCLI_API(handleKey)
(TCLI_SceneCtx *ctx, char key);

TCLI_API(handleJump)
(TCLI_SceneCtx *ctx, void *next);

TCLI_API(handleAction)
(TCLI_SceneCtx *ctx, TCLI_Action *action);

TCLI_API(makeInteractions)
(
	TCLI_ElemHdr *hdr,
	TCLI_Action *onEnter,
	TCLI_Action *onKey
);

#endif		// _UI_H
