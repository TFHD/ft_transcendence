/**
 * context.h
 */

#ifndef		_CONTEXT_H
# define	_CONTEXT_H

# include <string.h>
# include <stdlib.h>

# include <curl.h>

# include <types.h>
# include <screen.h>

# define	TCLI_USAGE	"[%s] Usage: %s \033[1mIP\033[0m\n"

typedef enum
{
	TCLI_FLAG_OK	= 1 << 0,
	TCLI_SCENE_SWAP	= 1 << 1,
	TCLI_REPLY		= 1 << 2,
	TCLI_PONG_GAME	= 1 << 3,
	TCLI_PONG_SOLO	= 1 << 4,
}	TCLI(Flags);

struct	_tcli_buff
{
	char		*data;
	uint32_t	len;
};

struct _tcli
{
	uint64_t			status;
	TCLI_Screen			screen;
	TCLI_Scene			scene;

	const char			*prog_name;
	const char			*ip;
	char				*url;
	struct curl_slist	*resolve;
	struct curl_slist	*cookie;
	struct curl_slist	*headers;
	char				*postfields;
	TCLI(Buffer)		buffer;

	double				ballX;
	double				ballY;
	double				p1Y;
	double				p2Y;
};

extern	CURL		*CURL_CTX;
extern	TCLI		*TCLI_CTX;
extern	char		TCLI_TMP[1024];
extern	char		TCLI_WSBUF_RECV[1024];
extern	char		TCLI_WSBUF_SEND[1024];

# define	TCLI_STATUS			TCLI_CTX->status
# define	TCLI_ACTIVE			(TCLI_CTX->status & TCLI_FLAG_OK)

# define	TCLI_SCREEN			TCLI_CTX->screen
# define	TCLI_WIDTH			TCLI_CTX->screen.width
# define	TCLI_HEIGHT			(TCLI_CTX->screen.height * 2)

# define	TCLI_SCENE			TCLI_CTX->scene

# define	TCLI_EXE			TCLI_CTX->prog_name

# define	TCLI_URL			TCLI_CTX->url
# define	TCLI_URL_HDR		"https://Trans:8000/api/"
# define	TCLI_WSS_HDR		"wss://Trans:8000/api/"
# define	TCLI_WSS_UPGRADE	"wss://Trans:8000/api/pong/practice?username=sacha&terminal=true"
# define	TCLI_WSS_MULTI		"wss://Trans:8000/api/pong/duo?roomID=cacaca&username=sacha&terminal=true"

# define	TCLI_IP				TCLI_CTX->ip

# define	TCLI_RESOLVE		TCLI_CTX->resolve
# define	TCLI_CERT_PATH		"auth/cert.pem"

# define	TCLI_COOKIE			TCLI_CTX->cookie
# define	TCLI_COOKIE_LEN		152
# define	TCLI_COOKIE_FP		".cookiejar"

# define	TCLI_HDRS			TCLI_CTX->headers
# define	TCLI_TOKEN_HDR		"authorization: Bearer "

# define	TCLI_POSTFIELDS		TCLI_CTX->postfields

# define	TCLI_CBLEN			TCLI_CTX->buffer.len
# define	TCLI_CBSTR			TCLI_CTX->buffer.data

TCLI_API(init)
(int argc, char **argv);

TCLI_API(cleanup)
(void);

TCLI_API(error)
(const char *msg);

TCLI_API(usage)
(int err);

#endif		// _CONTEXT_H
