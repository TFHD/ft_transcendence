/**
 * types.h
 */

#ifndef		_TYPES_H
# define	_TYPES_H

# include <stdint.h>

# define	SHIFT(ac, av)	(ac-- ,*av++)
# define	MAX(a, b)		(a > b ? a : b)
# define	ABS(x)			(x > 0 ? x : -x)

# define	TCLI(X)				TCLI_##X
# define	TCLI_API(X)			void TCLI_##X
# define	TCLI_INTERN(X)		static TCLI_API(X)
# define	TCLI_SCENE_FUNC(X)	TCLI_SceneCtx	*TCLI_##X(void)

# define	CURL_CTX	__curl_ctx
# define	CURLM_CTX	__curlm_ctx
# define	TCLI_CTX	__TCLI_ctx
# define	TCLI_TMP	__TCLI_tmp

typedef struct	_tcli_events		TCLI_Events;

typedef struct	_tcli_screen		TCLI_Screen;
typedef struct	_tcli_vec2			vec2;
typedef struct	_tcli_fvec2			fvec2;

typedef struct	_tcli				TCLI;
typedef struct	_tcli_elemHdr		TCLI_ElemHdr;
typedef struct	_tcli_transform		TCLI_Transform;
typedef struct	_tcli_interactable	TCLI_Interactable;
typedef struct	_tcli_action		TCLI_Action;
typedef struct	_tcli_elem			TCLI_Elem;
typedef struct	_tcli_sceneCtx		TCLI_SceneCtx;

typedef struct	_tcli_buff			TCLI_Buffer;
typedef enum	_tcli_reqtype		TCLI_RequestType;

typedef TCLI_SceneCtx				*(*TCLI_Scene)(void);
typedef void						(*TCLI_Renderer)(TCLI_ElemHdr *);
typedef void						(*TCLI_SceneLoader)(TCLI_Scene *);
typedef void						(*TCLI_ElemLoader)(TCLI_SceneCtx *, TCLI_ElemHdr *);
typedef void						(*TCLI_Requester)(TCLI_SceneCtx *, uint64_t);
typedef void						(*TCLI_Evaluer)(uint64_t);

#endif		// _TYPES_H
