/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   transcendence.h                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rgramati <rgramati@42angouleme.fr>         +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/09 19:52:06 by rgramati          #+#    #+#             */
/*   Updated: 2025/05/17 20:30:25 by rgramati         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/*
 *	CLI Transcendence header.
 */

#ifndef	TRANSCENDENCE_H
# define TRANSCENDENCE_H

# include <stdio.h>
# include <string.h>
# include <stdlib.h>
# include <stdarg.h>

# include <curl.h>
# include <cJSON.h>
# include <nopoll.h>

# include <screen.h>

# define	SHIFT(ac, av)	(ac-- ,*av++)

# define	INLINE			static inline
# define	TCLI_FUNC(X)	TCLI_##X
# define	TCLI_API(T, X)	INLINE T TCLI_FUNC(X)

enum
{
	TCLI_ELEM_TEXT = 0,
	TCLI_ELEM_TEXTBOX = 1,
	TCLI_ELEM_BUTTON = 2,
	TCLI_ELEM_IMAGE = 3,
};

# define	TCLI_ELEM_LAST ((void *)-1UL)

enum
{
	TCLI_ARROW_UP = 0,
	TCLI_ARROW_DOWN = 1,
	TCLI_ARROW_RIGHT = 2,
	TCLI_ARROW_LEFT = 3,
};

typedef struct
{
	uint32_t	type;
	uint32_t	flags;
}	TCLI_ElemHdr;

enum
{
	TCLI_IDX_BOX = 0,
	TCLI_IDX_TEXT = 1,
	TCLI_IDX_INPUT = 2,

	TCLI_IDX_LAST = 4
};

typedef void	(*TCLI_Action)(TCLI_ElemHdr *elem);

typedef struct s_tcli_elem
{
	TCLI_ElemHdr		h;
	struct s_tcli_elem	*nexts[4];
	char				txt[16];
	char				input[16];
	uint32_t			colors[4];
	vec2				pos[4];
	vec2				size;
	void				*slink;
	TCLI_Action			onSelect;
	TCLI_Action			onDeselect;
}	TCLI_Elem;

typedef struct
{
	TCLI_Elem	elems[16];
	TCLI_Elem	*select;
	TCLI_Elem	*last;
	uint32_t	count;
}	TCLI_SceneCtx;

typedef TCLI_SceneCtx	*(*TCLI_Scene)(void);

# define	TCLI_MENU_BTN_W		55

void	TCLI_FUNC(rootElem)(TCLI_SceneCtx *ctx);

TCLI_Elem	*TCLI_FUNC(newButton)
(TCLI_SceneCtx *ctx, const char *txt, vec2 pos, vec2 size, uint32_t txtColor, uint32_t boxColor);

TCLI_Elem	*TCLI_FUNC(newText)
(TCLI_SceneCtx *ctx, const char *txt, vec2 pos, uint32_t txtColor);

TCLI_Elem	*TCLI_FUNC(newTextbox)
(TCLI_SceneCtx *ctx, const char *txt, vec2 pos, uint32_t txtColor);

TCLI_Elem	*TCLI_FUNC(findElem)(TCLI_SceneCtx *ctx, const char *name);

void	TCLI_FUNC(setColor)(TCLI_Elem *elem, uint8_t idx, uint32_t color);
void	TCLI_FUNC(setNext)(TCLI_Elem *elem, uint8_t idx, TCLI_Elem *next);
void	TCLI_FUNC(setLink)(TCLI_Elem *elem, void *s);

typedef struct s_cli_ctx
{
	uint64_t			status;
	TCLI_Screen			screen;
	TCLI_Scene			scene;

	const char			*prog_name;
	const char			*ip;
	const char			*url;
	struct curl_slist	*resolve;
	struct curl_slist	*cookie;
	struct curl_slist	*headers;
	const char			*postfields;
}	TCLI;

# define	CURL_CTX	__curl_ctx
# define	TCLI_CTX	__TCLI_ctx
# define	TCLI_TMP	__TCLI_tmp

extern	CURL		*CURL_CTX;
extern	TCLI		*TCLI_CTX;
extern	char		TCLI_TMP[1024];

enum
{
	TCLI_FLAG_OK	= 1 << 0,
	TCLI_SCENE_SWAP	= 1 << 1
};

# define	TCLI_STATUS		TCLI_CTX->status
# define	TCLI_ACTIVE		(TCLI_CTX->status & TCLI_FLAG_OK)

# define	TCLI_SCREEN		TCLI_CTX->screen
# define	TCLI_WIDTH		TCLI_CTX->screen.width
# define	TCLI_HEIGHT		(TCLI_CTX->screen.height * 2)

# define	TCLI_SCENE			TCLI_CTX->scene
# define	TCLI_SCENE_FUNC(X)	TCLI_SceneCtx	*TCLI_FUNC(X)(void)

# define	TCLI_EXE		TCLI_CTX->prog_name

# define	TCLI_URL		TCLI_CTX->url
# define	TCLI_URL_HDR	"https://Trans:8000/api/"

# define	TCLI_IP			TCLI_CTX->ip

# define	TCLI_RESOLVE	TCLI_CTX->resolve
# define	TCLI_CERT_PATH	"auth/cert.pem"

# define	TCLI_COOKIE		TCLI_CTX->cookie
# define	TCLI_COOKIE_LEN	152
# define	TCLI_COOKIE_FP	".cookiejar"

# define	TCLI_HDRS		TCLI_CTX->headers
# define	TCLI_TOKEN_HDR	"authorization: Bearer "

# define	TCLI_POSTFIELDS	TCLI_CTX->postfields

TCLI_SCENE_FUNC(mainMenu);
TCLI_SCENE_FUNC(loginPage);
TCLI_SCENE_FUNC(registerPage);
TCLI_SCENE_FUNC(settingsPage);
TCLI_SCENE_FUNC(lobbyPage);
TCLI_SCENE_FUNC(gamePage);
TCLI_SCENE_FUNC(quit);

TCLI_SCENE_FUNC(debugPage);

TCLI_API(void, error)(const char *);
TCLI_API(void, usage)(int err);
TCLI_API(void, ipResolve)(void);
TCLI_API(void, cookieInit)(void);

TCLI_API(void, init)(int argc, char **argv)
{
	if (TCLI_CTX)
		return ;

	TCLI_CTX = malloc(sizeof(TCLI));
	if (!TCLI_CTX)
		TCLI_error("failed to init TCLI context.");
	memset(TCLI_CTX, 0, sizeof(TCLI));
	
	screen_init(&TCLI_SCREEN);
	if (!TCLI_SCREEN.data)
		TCLI_error("failed to init TCLI screen.");
	
	TCLI_EXE = SHIFT(argc, argv);
	if (argc != 1)
		TCLI_usage(1);
	TCLI_IP = SHIFT(argc, argv);

	CURL_CTX = curl_easy_init();
	if (!CURL_CTX)
		TCLI_error("failed to init CURL context.");

	curl_easy_setopt(CURL_CTX,  CURLOPT_VERBOSE, 1L);
	curl_easy_setopt(CURL_CTX,  CURLOPT_TIMEOUT, 10L);
	curl_easy_setopt(CURL_CTX, CURLOPT_CAINFO, TCLI_CERT_PATH);
	curl_easy_setopt(CURL_CTX, CURLOPT_SSL_VERIFYPEER, 1L);	// Need SSL verification
	curl_easy_setopt(CURL_CTX, CURLOPT_SSL_VERIFYHOST, 2L);

	TCLI_cookieInit();
	TCLI_ipResolve();

	TCLI_STATUS |= TCLI_FLAG_OK;
}

TCLI_API(void, cleanup)(void)
{
	screen_destroy(&TCLI_CTX->screen);
	if (TCLI_RESOLVE)
		curl_slist_free_all(TCLI_RESOLVE);
	if (TCLI_COOKIE)
		curl_slist_free_all(TCLI_COOKIE);
	if (TCLI_HDRS)
		curl_slist_free_all(TCLI_HDRS);
	if (CURL_CTX)
		curl_easy_cleanup(CURL_CTX);
	free(TCLI_CTX);
}

TCLI_API(void, error)(const char *msg)
{
	if (msg)
		printf("[%s] Error: %s\n", TCLI_EXE, msg);
	exit(1);
}

# define	TCLI_USAGE	"[%s] Usage: %s \033[1mIP\033[0m\n"

TCLI_API(void, usage)(int err)
{
	printf(TCLI_USAGE, TCLI_EXE, TCLI_EXE);
	exit(err);
}

TCLI_API(void, cookieInit)(void)
{
	curl_easy_setopt(CURL_CTX, CURLOPT_COOKIEFILE, "");
	curl_easy_setopt(CURL_CTX, CURLOPT_COOKIEJAR, TCLI_COOKIE_FP);
}

TCLI_API(const char *, cookieGet)(void)
{
	if (!TCLI_COOKIE)
		curl_easy_getinfo(CURL_CTX, CURLINFO_COOKIELIST, &(TCLI_COOKIE));
	if (!TCLI_COOKIE)
		return (NULL);

	char	*cdata	= TCLI_COOKIE->data;
	char	*end	= cdata + strlen(cdata) - TCLI_COOKIE_LEN;
	
	return (end);
}

TCLI_API(void, ipResolve)(void)
{
	if (TCLI_RESOLVE)
		return ;
	
	const uint32_t	ipl = strlen(TCLI_IP);

	memcpy(TCLI_TMP, "Trans:8000:", 11);
	memcpy(TCLI_TMP + 11, TCLI_IP, ipl);

	TCLI_TMP[11 + ipl] = 0;

	TCLI_RESOLVE = curl_slist_append(NULL, TCLI_TMP);

	curl_easy_setopt(CURL_CTX, CURLOPT_RESOLVE, TCLI_RESOLVE);
}

TCLI_API(void, makeUrl)(const char *endpoint)
{
	static char		url[128];
	const uint32_t	hdrl = strlen(TCLI_URL_HDR);
	const uint32_t	endl = strlen(endpoint);

	if (hdrl + endl >= 128)
		TCLI_error("request too long.");

	memcpy(url,			TCLI_URL_HDR,	hdrl);
	memcpy(url + hdrl,	endpoint,		endl);
	url[hdrl + endl] = 0;

	TCLI_URL = url;
}

TCLI_API(void, makeRequestHeaders)(int c, ...)
{
	va_list	hdr;

	va_start(hdr, c);
	while (c--)
	{
		char	*elem = va_arg(hdr, char *);

		TCLI_HDRS = curl_slist_append(TCLI_HDRS, elem);
	}
	va_end(hdr);
}

TCLI_API(void, makePostfields)(cJSON *post)
{
	TCLI_POSTFIELDS = cJSON_Print(post);
	cJSON_Delete(post);
}

# define	TCLI_JSON_HDR		"Content-Type: application/json"

# define	TCLI_ENDPOINT_LOGIN	"auth/login"

TCLI_API(void, login)(const char *user, const char *pass)
{
	TCLI_makeUrl(TCLI_ENDPOINT_LOGIN);
	TCLI_makeRequestHeaders(1, TCLI_JSON_HDR);

	cJSON	*log = cJSON_CreateObject();
	void	*tmp = NULL;

	tmp = cJSON_AddStringToObject(log, "email", user);
	if (!tmp) goto defer;

	tmp = cJSON_AddStringToObject(log, "username", user);
	if (!tmp) goto defer;
	
	tmp = cJSON_AddStringToObject(log, "password", pass);
	if (!tmp) goto defer;

	TCLI_makePostfields(log);
	
	return ;

defer:
	TCLI_error("json creation failed.");
}

typedef enum
{
	TCLI_GET	= 1 << 0,
	TCLI_POST	= 1 << 1,
	TCLI_PATCH	= 1 << 2,
	TCLI_DELETE = 1 << 3,
}	TCLI_reqtype;

typedef enum
{
	TCLI_REQ_LOGIN		= 1 << 4,
	TCLI_REQ_REGISTER	= 1 << 4,
}	TCLI_req;

typedef struct
{
	char		*data;
	uint32_t	len;
}	TCLI_buff;

TCLI_API(void, makeRequest)(uint16_t type)
{
	if (type & TCLI_REQ_LOGIN)
		TCLI_login("caca", "12345678");

	if (type & TCLI_POST)
		curl_easy_setopt(CURL_CTX, CURLOPT_POSTFIELDS, TCLI_POSTFIELDS);
}

TCLI_API(uint32_t, curlCB)(void *ptr, uint32_t size, uint32_t nmemb, void *ud)
{
	uint32_t	total = size * nmemb;
	TCLI_buff	*cb = ud;

	cb->data = realloc(cb->data, cb->len + total + 1);
	memcpy(cb->data + cb->len, ptr, total);
	cb->len += total;
	cb->data[cb->len] = 0;

	return (total);
}

# define	TCLI_REQUEST_FAILED	"[%s] Warning: http request failed with error code %d\n"

TCLI_API(int, sendRequest)(void)
{
	if (TCLI_POSTFIELDS)
		printf("postfieds = %s\n", TCLI_POSTFIELDS);

	curl_easy_setopt(CURL_CTX, CURLOPT_HTTPHEADER, TCLI_HDRS);
	curl_easy_setopt(CURL_CTX, CURLOPT_URL, TCLI_URL);

	CURLcode	res = curl_easy_perform(CURL_CTX);

	if (res != CURLE_OK)
		printf(TCLI_REQUEST_FAILED, TCLI_EXE, res);

	curl_slist_free_all(TCLI_HDRS);
	curl_easy_reset(CURL_CTX);

	return ((int)res);
}

#endif
