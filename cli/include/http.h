/**
 * http.h
 */

#ifndef		_HTTP_H
# define	_HTTP_H

# include <cJSON.h>

# include <types.h>
# include <context.h>
# include <scenes.h>

enum	_tcli_reqtype
{
	TCLI_GET	= 1 << 0,
	TCLI_POST	= 1 << 1,
	TCLI_PATCH	= 1 << 2,
	TCLI_DELETE = 1 << 3,
	TCLI_WSS	= 1 << 4,
};

enum	_tcli_acttype
{
	TCLI_DO_LOGIN,
	TCLI_DO_REGISTER,
	TCLI_DO_QR
};

// Curl answer callback
uint32_t	TCLI(curlCB)
(void *ptr, uint32_t size, uint32_t nmemb, void *ud);

TCLI_API(cookieGet)
(char **cookie);

TCLI_API(makeUrl)
(const char *endpoint);

TCLI_API(makeUrlWS)
(const char *endpoint);

TCLI_API(makeRequestHeaders)
(int c, ...);

TCLI_API(makePostfields)
(cJSON *post);

// Last call to make an HTTP Request
TCLI_API(sendRequest)
(int *res, TCLI(RequestType) type);

TCLI_API(makeRequest)
(TCLI(SceneCtx) *ctx, uint64_t type);

// upgrade to wss  connection , to be called before game, fallback to  http after
TCLI_API(wssUpgrade)
(void);

TCLI_API(handleWsFrames)
(void);

// evaluate request reply for future branching
TCLI_API(evalReply)
(uint64_t type);

// ACTUAL REQUEST CONSTRUCTORS
TCLI_API(login)
(const char *user, const char *pass);

#endif		// _HTTP_H
