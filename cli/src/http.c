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

TCLI_API(getCookie)(char **cookie)
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

	if (hdrl + endl >= 1024)
		TCLI_error("request too long.");

	memcpy(TCLI_TMP,		TCLI_WSS_HDR,	hdrl);
	memcpy(TCLI_TMP + hdrl,	endpoint,		endl);
	TCLI_TMP[hdrl + endl] = 0;

	free(TCLI_URL);
	TCLI_URL = strdup(TCLI_TMP);
}

TCLI_API(makeGameUrl)(TCLI_GameInfo *game)
{
	static char	endpoint[256] = {0};

	if (*endpoint)
		memset(endpoint, 0, 256);

	strcat(endpoint, "pong/");
	strcat(endpoint, game->mode);
	strcat(endpoint, "?username=");
	strcat(endpoint, game->username);
	if (!strcmp(game->mode, "duo"))
	{
		strcat(endpoint, "&roomID=");
		strcat(endpoint, game->roomid);
	}
	strcat(endpoint, "&terminal=true");
	TCLI_makeUrlWS(endpoint);
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

TCLI_API(login)(TCLI_LogInfo *info)
{
	TCLI_makeRequestHeaders(1, TCLI_JSON_HDR);

	cJSON	*log = cJSON_CreateObject();
	void	*tmp = NULL;

	tmp = cJSON_AddStringToObject(log, "email", info->username);
	if (!tmp) goto defer;

	tmp = cJSON_AddStringToObject(log, "username", info->username);
	if (!tmp) goto defer;
	
	tmp = cJSON_AddStringToObject(log, "password", info->password);
	if (!tmp) goto defer;

	TCLI_makePostfields(log);
	
	return ;

defer:
	TCLI_error("LOGIN : json creation failed.");
}

TCLI_API(register)(TCLI_LogInfo *info)
{
	TCLI_makeRequestHeaders(1, TCLI_JSON_HDR);

	cJSON	*log = cJSON_CreateObject();
	void	*tmp = NULL;

	tmp = cJSON_AddStringToObject(log, "email", info->email);
	if (!tmp) goto defer;

	tmp = cJSON_AddStringToObject(log, "username", info->username);
	if (!tmp) goto defer;
	
	tmp = cJSON_AddStringToObject(log, "password", info->password);
	if (!tmp) goto defer;

	TCLI_makePostfields(log);
	
	return ;

defer:
	TCLI_error("LOGIN : json creation failed.");
}

TCLI_API(logout)(void)
{
	TCLI_makeRequestHeaders(1, TCLI_JSON_HDR);

	cJSON	*log = cJSON_CreateObject();

	TCLI_makePostfields(log);
	
	return ;
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

TCLI_API(makeRequest)(TCLI_SceneCtx *ctx, void *arg)
{
	int				res = 0;
	uint64_t		type = (uint64_t)arg;
	TCLI_LogInfo	*log = ctx->data;
	const char		*endpoints[3] = 
	{
		[TCLI_DO_LOGIN]			= "auth/login",
		[TCLI_DO_LOGOUT]		= "auth/logout",
		[TCLI_DO_REGISTER]		= "auth/register",
	};
	
	if (type > TCLI_DO_REGISTER)
		exit(69);

	TCLI_makeUrl(endpoints[type]);
	switch (type)
	{
		case TCLI_DO_LOGIN:
			TCLI_login(log);
			break ;
		case TCLI_DO_REGISTER:
			TCLI_register(log);
			break ;
		case TCLI_DO_LOGOUT:
			TCLI_logout();
			break ;
		default:
			exit(69);
	}
	TCLI_sendRequest(&res, TCLI_POST);
}

TCLI_API(evalReply)(TCLI_SceneCtx *ctx, void *arg)
{
	(void)	ctx;

	cJSON		*reply = cJSON_Parse(TCLI_CBSTR);
	cJSON		*tmp = NULL;
	uint64_t	type = (uint64_t)arg;

	switch (type)
	{
		case TCLI_DO_REGISTER:
			tmp = cJSON_GetObjectItemCaseSensitive(reply, "user");
			if (!tmp)
			{
				tmp = cJSON_GetObjectItemCaseSensitive(reply, "message");
				if (cJSON_IsString(tmp))
				{
					free(TCLI_ERROR_MSG);
					TCLI_ERROR_MSG = strdup(tmp->valuestring);
				}
				break ;
			}
			TCLI_STATUS |= TCLI_REPLY;
			break ;
		case TCLI_DO_LOGIN:
			tmp = cJSON_GetObjectItemCaseSensitive(reply, "success");
			if (!tmp)
			{
				tmp = cJSON_GetObjectItemCaseSensitive(reply, "message");
				if (cJSON_IsString(tmp))
				{
					free(TCLI_ERROR_MSG);
					TCLI_ERROR_MSG = strdup(tmp->valuestring);
				}
			}
			else
			{
				if (cJSON_IsBool(tmp) && cJSON_IsTrue(tmp))
					TCLI_STATUS |= TCLI_REPLY;
				const char	*username = ((TCLI_LogInfo *)(TCLI_loginPage()->data))->username;
				strcpy(TCLI_GAME_INFO.username, username);
			}
			break ;
		case TCLI_DO_LOGOUT:
			TCLI_STATUS |= TCLI_REPLY;
			break ;
		default:
			break ;
	}
	cJSON_Delete(reply);
}

TCLI_API(react)(TCLI_SceneCtx *ctx, void *errorMsg)
{
	(void)	ctx;

	if (TCLI_STATUS & TCLI_REPLY)
	{
		TCLI_STATUS &= ~TCLI_REPLY;
		return ;
	}

	TCLI_Elem	*elem = (TCLI_Elem *)errorMsg;

	TCLI_STATUS |= TCLI_ACTION_SKIP;
	elem->data = TCLI_ERROR_MSG;
}
