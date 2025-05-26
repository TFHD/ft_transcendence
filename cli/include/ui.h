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

# define	KACTION(F, A, K)	(TCLI_Action){.func = F, .arg = A, .key = K}
# define	ACTION(F, A)		KACTION(F, A, -1)
# define	NOOP()				KACTION(NULL, NULL, -1)
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
	void	*func;
	void	*arg;
	int32_t	key;
};

struct	_tcli_interactable
{
	TCLI_Action	onSelect;
	TCLI_Action	onDeselect;
	TCLI_Action	*onEnter;
	TCLI_Action	*onKey;
	uint32_t	onEnterCount;
	uint32_t	onKeyCount;
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
	void				*data;
};

typedef struct	_tcli_loginfo
{
	char	username[16];
	char	password[16];
	char	confirm[16];
	char	twoFa[7];
	char	_reserved;
}	TCLI_LogInfo;

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
(void *toLoad);

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
(TCLI_SceneCtx *ctx, TCLI_ElemHdr *next);

TCLI_API(handleAction)
(TCLI_SceneCtx *ctx, TCLI_Action *action);

TCLI_API(makeInteractions)
(
	TCLI_ElemHdr *hdr,
	TCLI_Action *onEnter,
	TCLI_Action *onKey
);

#endif		// _UI_H
