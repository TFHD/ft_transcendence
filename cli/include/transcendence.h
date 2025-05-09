/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   transcendence.h                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rgramati <rgramati@42angouleme.fr>         +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/09 19:52:06 by rgramati          #+#    #+#             */
/*   Updated: 2025/05/09 20:30:36 by rgramati         ###   ########.fr       */
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

# define	SHIFT(ac, av)	(ac-- ,*av++)

# define	INLINE			static inline
# define	DESTRUCTOR		__attribute__((destructor))
# define	CONSTRUCTOR		__attribute__((constructor))
# define	TCLI_FUNC(X)	tcli_##X
# define	TCLI_API(T, X)	INLINE T TCLI_FUNC(X)

typedef struct s_cli_ctx
{
	uint64_t			status;
	const char			*prog_name;
	const char			*ip;
	const char			*url;
	struct curl_slist	*resolve;
	struct curl_slist	*cookie;
	struct curl_slist	*headers;
}	TCLI;

# define	CURL_CTX	__curl_ctx
# define	TCLI_CTX	__tcli_ctx
# define	TCLI_TMP	__tcli_tmp

static CURL	*CURL_CTX	= NULL;
static TCLI	*TCLI_CTX	= NULL;

static char	TCLI_TMP[512]	= {0};

enum
{
	TCLI_FLAG_OK	= 1 << 0,
};

# define	TCLI_STATUS		TCLI_CTX->status
# define	TCLI_ACTIVE		(TCLI_CTX->status & TCLI_FLAG_OK)

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
		tcli_error("failed to init TCLI context.");
	memset(TCLI_CTX, 0, sizeof(TCLI));
	
	TCLI_EXE = SHIFT(argc, argv);
	if (argc != 1)
		tcli_usage(1);
	TCLI_IP = SHIFT(argc, argv);

	CURL_CTX = curl_easy_init();
	if (!CURL_CTX)
		tcli_error("failed to init CURL context.");

	curl_easy_setopt(CURL_CTX, CURLOPT_CAINFO, TCLI_CERT_PATH);
	curl_easy_setopt(CURL_CTX, CURLOPT_SSL_VERIFYPEER, 1L);	// Need SSL verification
	curl_easy_setopt(CURL_CTX, CURLOPT_SSL_VERIFYHOST, 2L);

	tcli_cookieInit();
	tcli_ipResolve();
}

TCLI_API(void, cleanup)(void)
{
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
		tcli_error("request too long.");

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

TCLI_API(void, makeRequest)()
{
	
}

# define	TCLI_REQUEST_FAILED	"[%s] Warning: http request failed with error code %d\n"

TCLI_API(int, sendRequest)(void)
{
	CURLcode	res = curl_easy_perform(CURL_CTX);

	if (res != CURLE_OK)
		printf(TCLI_REQUEST_FAILED, TCLI_EXE, res);

	curl_slist_free_all(TCLI_HDRS);
	curl_easy_reset(CURL_CTX);

	return ((int)res);
}

#endif
