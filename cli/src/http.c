/**
 * http.h
 */

#include <http.h>

uint32_t	TCLI_curlCB(void *ptr, uint32_t size, uint32_t nmemb, void *ud)
{
	uint32_t		total = size * nmemb;
	TCLI_Buffer	*cb = ud;

	cb->data = realloc(cb->data, cb->len + total + 1);
	memcpy(cb->data + cb->len, ptr, total);
	cb->len += total;
	cb->data[cb->len] = 0;

	return (total);
}

TCLI_API(cookieGet)(char **cookie)
{
	if (!cookie)
		return ;
	if (!TCLI_COOKIE)
		curl_easy_getinfo(CURL_CTX, CURLINFO_COOKIELIST, &(TCLI_COOKIE));
	if (!TCLI_COOKIE)
		*cookie = NULL;

	char	*cdata	= TCLI_COOKIE->data;
	char	*end	= cdata + strlen(cdata) - TCLI_COOKIE_LEN;
	
	*cookie = end;
}

TCLI_API(makeUrl)(const char *endpoint)
{
	const uint32_t	hdrl = strlen(TCLI_URL_HDR);
	const uint32_t	endl = strlen(endpoint);

	if (hdrl + endl >= 128)
		TCLI_error("request too long.");

	memcpy(TCLI_TMP,		TCLI_URL_HDR,	hdrl);
	memcpy(TCLI_TMP + hdrl,	endpoint,		endl);
	TCLI_TMP[hdrl + endl] = 0;

	free(TCLI_URL);
	TCLI_URL = strdup(TCLI_TMP);
}

TCLI_API(makeUrlWS)(const char *endpoint)
{
	const uint32_t	hdrl = strlen(TCLI_WSS_HDR);
	const uint32_t	endl = strlen(endpoint);

	if (hdrl + endl >= 128)
		TCLI_error("request too long.");

	memcpy(TCLI_TMP,		TCLI_WSS_HDR,	hdrl);
	memcpy(TCLI_TMP + hdrl,	endpoint,		endl);
	TCLI_TMP[hdrl + endl] = 0;

	free(TCLI_URL);
	TCLI_URL = strdup(TCLI_TMP);
}

TCLI_API(makeRequestHeaders)(int c, ...)
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

TCLI_API(makePostfields)(cJSON *post)
{
	TCLI_POSTFIELDS = cJSON_Print(post);
	cJSON_Delete(post);
}

# define	TCLI_JSON_HDR		"Content-Type: application/json"
# define	TCLI_ENDPOINT_LOGIN	"auth/login"

TCLI_API(login)(const char *user, const char *pass)
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
	TCLI_error("LOGIN : json creation failed.");
}

#define TCLI_ENDPOINT_QR	"auth/2fa/setup"

TCLI_API(doQR)(void)
{
	TCLI_makeUrl(TCLI_ENDPOINT_QR);
}

# define	TCLI_REQUEST_FAILED	"[%s] Warning: http request failed with error code %d\n"

TCLI_API(sendRequest)(int *res, TCLI_RequestType type)
{
	curl_easy_setopt(CURL_CTX, CURLOPT_HTTPHEADER, TCLI_HDRS);
	curl_easy_setopt(CURL_CTX, CURLOPT_URL, TCLI_URL);

	if (TCLI_POSTFIELDS)
		curl_easy_setopt(CURL_CTX, CURLOPT_POSTFIELDS, TCLI_POSTFIELDS);
	if (type == TCLI_GET)
		curl_easy_setopt(CURL_CTX, CURLOPT_HTTPGET, 1L);

	*res = curl_easy_perform(CURL_CTX);
	if (*res != CURLE_OK)
		printf(TCLI_REQUEST_FAILED, TCLI_EXE, *res);

	curl_slist_free_all(TCLI_HDRS);
	free(TCLI_POSTFIELDS);
	TCLI_HDRS = NULL;
	TCLI_POSTFIELDS = NULL;
	TCLI_CBLEN = 0;
}

TCLI_API(makeRequest)(TCLI_SceneCtx *ctx, uint64_t type)
{
	if (type == TCLI_DO_LOGIN)
	{
		int	res = 0;

		TCLI_login(ctx->elems[3].input, ctx->elems[4].input);
		TCLI_sendRequest(&res, TCLI_POST);

		//printf("received [%s]\n", TCLI_CBSTR);
		// TODO : maybe handle request errors one day
	}
	if (type == TCLI_DO_QR)
	{
		int res = 0;

		TCLI_login("sacha", "12345678");
		TCLI_sendRequest(&res, TCLI_POST);
		TCLI_doQR();
		TCLI_sendRequest(&res, TCLI_GET);
	}
}

TCLI_API(handleWsFrames)(void)
{
	while (1)
	{
		uint64_t					nread = 0;
		const struct curl_ws_frame	*meta;

		CURLcode	rc = curl_ws_recv(CURL_CTX, TCLI_WSBUF_RECV, 1024, &nread, &meta);

		if (rc == CURLE_AGAIN)
			break ;
		if (rc != CURLE_OK)
		{
// 			TCLI_STATUS &= ~TCLI_FLAG_OK;
			break ;
		}
		if (meta->flags & CURLWS_TEXT)
			printf("TEXT: %.*s\n", (int)nread, TCLI_WSBUF_RECV);
	}
}

TCLI_API(evalReply)(uint64_t type)
{
	TCLI_STATUS &= ~TCLI_REPLY;
	if (type == TCLI_DO_LOGIN)
	{
		cJSON	*reply = cJSON_Parse(TCLI_CBSTR);
		cJSON	*success = cJSON_GetObjectItemCaseSensitive(reply, "success");

		if (cJSON_IsBool(success) && cJSON_IsTrue(success))
			TCLI_STATUS |= TCLI_REPLY;

		cJSON_Delete(reply);
	}
	if (type == TCLI_DO_QR)
	{
		cJSON	*reply = cJSON_Parse(TCLI_CBSTR);
		cJSON	*cli = cJSON_GetObjectItemCaseSensitive(reply, "cli");
		cJSON	*qr = cJSON_GetObjectItemCaseSensitive(cli, "qrCodeImage");
		cJSON	*sizeJ = cJSON_GetObjectItemCaseSensitive(cli, "size");
	
		if (!qr || !sizeJ)
		{
			cJSON_Delete(reply);
			printf("Missing information.");
			return ;
		}

		uint32_t	size = sizeJ->valueint;

		const cJSON	*line = NULL;
		uint32_t	line_count = 0;

		cJSON_ArrayForEach(line, qr)
		{
			const char	*linestring = line->valuestring;

			for (uint32_t i = 0; i < size; ++i)
			{
				TCLI_screenSetPixel(&TCLI_SCREEN, (vec2){i, line_count + 15}, linestring[i] == '0' ? 0xFFFFFF : 0);
			}
			line_count++;
		}

		cJSON_Delete(reply);
	}
}
