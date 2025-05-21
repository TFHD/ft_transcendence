/**
 * context.c
 */

#include <context.h>

CURL	*__curl_ctx	= NULL;
TCLI	*__TCLI_ctx	= NULL;

char	__TCLI_tmp[1024]	= {0};

TCLI_INTERN(cookieInit)(void);
TCLI_INTERN(ipResolve)(void);

TCLI_API(init)(int argc, char **argv)
{
	if (TCLI_CTX)
		return ;

	TCLI_CTX = malloc(sizeof(TCLI));
	if (!TCLI_CTX)
		TCLI(error)("failed to init TCLI context.");
	memset(TCLI_CTX, 0, sizeof(TCLI));
	
	TCLI(screenInit)(&TCLI_SCREEN);
	if (!TCLI_SCREEN.data)
		TCLI(error)("failed to init TCLI screen.");
	
	TCLI_EXE = SHIFT(argc, argv);
	if (argc != 1)
		TCLI(usage)(1);
	TCLI_IP = SHIFT(argc, argv);

	CURL_CTX = curl_easy_init();
	if (!CURL_CTX)
		TCLI(error)("failed to init CURL context.");

	curl_easy_setopt(CURL_CTX,  CURLOPT_VERBOSE, 1L);
	curl_easy_setopt(CURL_CTX,  CURLOPT_TIMEOUT, 10L);
	curl_easy_setopt(CURL_CTX, CURLOPT_CAINFO, TCLI_CERT_PATH);
	curl_easy_setopt(CURL_CTX, CURLOPT_SSL_VERIFYPEER, 1L);	// Need SSL verification
	curl_easy_setopt(CURL_CTX, CURLOPT_SSL_VERIFYHOST, 2L);

	TCLI(cookieInit)();
	TCLI(ipResolve)();

	TCLI_STATUS |= TCLI_FLAG_OK;
}

TCLI_API(cleanup)(void)
{
	TCLI(screenDestroy)(&TCLI_CTX->screen);
	if (TCLI_RESOLVE)
		curl_slist_free_all(TCLI_RESOLVE);
	if (TCLI_COOKIE)
		curl_slist_free_all(TCLI_COOKIE);
	if (TCLI_HDRS)
		curl_slist_free_all(TCLI_HDRS);
	if (CURL_CTX)
		curl_easy_cleanup(CURL_CTX);
	free(TCLI_CBSTR);
	free(TCLI_URL);
	free(TCLI_CTX);
}

TCLI_API(error)(const char *msg)
{
	if (msg)
		printf("[%s] Error: %s\n", TCLI_EXE, msg);
	exit(1);
}

TCLI_API(usage)(int err)
{
	printf(TCLI_USAGE, TCLI_EXE, TCLI_EXE);
	exit(err);
}

TCLI_INTERN(cookieInit)(void)
{
	curl_easy_setopt(CURL_CTX, CURLOPT_COOKIEFILE, "");
	curl_easy_setopt(CURL_CTX, CURLOPT_COOKIEJAR, TCLI_COOKIE_FP);
}

TCLI_INTERN(ipResolve)(void)
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
