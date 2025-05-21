/**
 * http.h
 */

#include <http.h>

uint32_t	TCLI(curlCB)(void *ptr, uint32_t size, uint32_t nmemb, void *ud)
{
	uint32_t		total = size * nmemb;
	TCLI(Buffer)	*cb = ud;

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
	TCLI(makeUrl)(TCLI_ENDPOINT_LOGIN);
	TCLI(makeRequestHeaders)(1, TCLI_JSON_HDR);

	cJSON	*log = cJSON_CreateObject();
	void	*tmp = NULL;

	tmp = cJSON_AddStringToObject(log, "email", user);
	if (!tmp) goto defer;

	tmp = cJSON_AddStringToObject(log, "username", user);
	if (!tmp) goto defer;
	
	tmp = cJSON_AddStringToObject(log, "password", pass);
	if (!tmp) goto defer;

	TCLI(makePostfields)(log);
	
	return ;

defer:
	TCLI(error)("LOGIN : json creation failed.");
}

# define	TCLI_REQUEST_FAILED	"[%s] Warning: http request failed with error code %d\n"

TCLI_API(sendRequest)(int *res)
{
	curl_easy_setopt(CURL_CTX, CURLOPT_HTTPHEADER, TCLI_HDRS);
	curl_easy_setopt(CURL_CTX, CURLOPT_URL, TCLI_URL);

	if (TCLI_POSTFIELDS)
	{
		curl_easy_setopt(CURL_CTX, CURLOPT_POSTFIELDS, TCLI_POSTFIELDS);
		printf("POST = %s\n", TCLI_POSTFIELDS);
	}

	*res = curl_easy_perform(CURL_CTX);
	if (*res != CURLE_OK)
		printf(TCLI_REQUEST_FAILED, TCLI_EXE, *res);

	curl_slist_free_all(TCLI_HDRS);
	TCLI_HDRS = NULL;
	free(TCLI_POSTFIELDS);
	TCLI_POSTFIELDS = NULL;
	TCLI_CBLEN = 0;
}

TCLI_API(makeRequest)(TCLI(SceneCtx) *ctx, uint64_t type)
{
	if (type == TCLI_DO_LOGIN)
	{
		int	res = 0;

		TCLI(login)(ctx->elems[3].input, ctx->elems[4].input);
		TCLI(sendRequest)(&res);

		printf("received [%s]\n", TCLI_CBSTR);
		// TODO : maybe handle request errors one day
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
	}
}
