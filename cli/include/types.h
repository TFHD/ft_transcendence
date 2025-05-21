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
# define	TCLI_API(X)			void TCLI(X)
# define	TCLI_INTERN(X)		static TCLI_API(X)
# define	TCLI_SCENE_FUNC(X)	TCLI_SceneCtx	*TCLI(X)(void)

# define	CURL_CTX	__curl_ctx
# define	TCLI_CTX	__TCLI_ctx
# define	TCLI_TMP	__TCLI_tmp

typedef struct	_tcli_screen		TCLI(Screen);
typedef struct	_tcli_vec2			vec2;
typedef struct	_tcli_fvec2			fvec2;

typedef struct	_tcli				TCLI;
typedef struct	_tcli_elemHdr		TCLI(ElemHdr);
typedef struct	_tcli_action		TCLI(Action);
typedef struct	_tcli_elem			TCLI(Elem);
typedef struct	_tcli_sceneCtx		TCLI(SceneCtx);

typedef struct	_tcli_buff			TCLI(Buffer);
typedef enum	_tcli_reqtype		TCLI(RequestType);

typedef TCLI(SceneCtx)				*(*TCLI(Scene))(void);
typedef void						(*TCLI(Renderer))(TCLI(Elem) *);
typedef void						(*TCLI(SceneLoader))(TCLI(Scene) *);
typedef void						(*TCLI(Requester))(TCLI(SceneCtx) *, uint64_t);
typedef void						(*TCLI(Evaluer))(uint64_t);

#endif		// _TYPES_H
