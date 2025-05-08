/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.c                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rgramati <rgramati@42angouleme.fr>         +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/05 21:12:12 by rgramati          #+#    #+#             */
/*   Updated: 2025/05/08 21:58:27 by rgramati         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/*
 *	CLI Transcendence application.
 */

// #include <stdio.h>
// #include <nopoll.h>
// 
// #define UNUSED	__attribute__((unused))
// 
// static void
// on_message (UNUSED noPollCtx  *ctx,
//             UNUSED noPollConn *conn,
//             UNUSED noPollMsg  *msg,
//             UNUSED void       *user_data)
// {
//     if (nopoll_msg_is_final (msg))
// 	{
//         int  len     = nopoll_msg_get_payload_size (msg);
//         const unsigned char *payload = nopoll_msg_get_payload (msg);
// 
//         char *text = malloc(len + 1);
//         memcpy(text, payload, len);
//         text[len] = '\0';
// 
//         printf("Received text: %s\n", text);
//         free(text);
//     }
// }

// int main(void)
// {
// 	noPollCtx	*ctx = nopoll_ctx_new ();
// 
// 	nopoll_log_enable(ctx, nopoll_true);
// 
// 	if (! ctx)
// 	{
// 		printf("nopoll: context creation failed.\n");
// 		goto defer;
// 	}
// 
// 	nopoll_ctx_set_on_msg(ctx, on_message, NULL);
// 	
// 	noPollConnOpts *opts = nopoll_conn_opts_new();
// 
// 	nopoll_conn_opts_ssl_peer_verify(opts, nopoll_false);
// 
// 	noPollConn	*conn = nopoll_conn_tls_new
// 	(
// 		ctx,
// 		opts,
// 		"localhost",
// 		"8000",
// 		NULL,
// 		"/api/pong/solo",
// 		NULL,
// 		"https://localhost:3000"
// 	);
// 	if (!nopoll_conn_is_ok(conn))
// 	{
// 		printf("nopoll: connection not OK...\n");
// 		goto defer;
// 	}
// 	
// 	int elapsed = 0;
// 	while (!nopoll_conn_is_ready(conn) && elapsed < 5000)
// 	{
// 		nopoll_loop_wait(ctx, 100);
// 		elapsed += 100;
// 	}
// 	if (!nopoll_conn_is_ready(conn))
// 	{
// 		printf("nopoll: handshake failed or timed out\n");
// 		goto defer;
// 	}
// 
// 	if (nopoll_conn_send_text(conn, "{\"key\":\"w\", \"state\":true}", 25) != 25)
// 	{
// 		printf("nopoll: inequality in msg length.\n");
// 		goto defer;
// 	}
// 
// 	printf("Message sent.\n");
// 
//     for (;;) {
//       nopoll_loop_wait(ctx, 100);
//     }
// 
// defer:
// 	nopoll_ctx_unref(ctx);
// 	return (0);
// }


#include <stdio.h>
#include <nopoll.h>
#include <curl.h>

#define	CLI_URL			"https://10.12.1.1:8000/api/"

#define	CLI_CERT_PATH	"cert.pem"
#define	AUTH_HEADER		"authorization: Bearer "

#define	CLI_COOKIE_LEN	152

typedef enum e_cli_reqtype
{
	CLI_GET = 1,
	CLI_POST = 2,
	CLI_PATCH = 3,
	CLI_DELETE = 4,
}	cli_reqtype;

#define		CULR_CTX	__curl_ctx;
static CURL	*CURL_CTX = {0};

int	cli_request_send(cli_reqtype type, const char *endpoint, char **headers, char *post)
{
	char				buffer[512] = {0};
	struct curl_slist	*hdr = NULL;

	strcat(buffer, CLI_URL);
	strcat(buffer, endpoint);

	while (headers && *headers)
		hdr = curl_slist_append(hdr, *headers++);

	curl_easy_setopt(CURL_CTX, CURLOPT_CAINFO,			CLI_CERT_PATH);
	curl_easy_setopt(CURL_CTX, CURLOPT_HTTPHEADER,		hdr);
    curl_easy_setopt(CURL_CTX, CURLOPT_URL,				buffer);

	if (type == CLI_POST)
		curl_easy_setopt(CURL_CTX, CURLOPT_POSTFIELDS,	post);

    curl_easy_setopt(CURL_CTX, CURLOPT_SSL_VERIFYPEER,	0L);	// Need SSL verification
    curl_easy_setopt(CURL_CTX, CURLOPT_SSL_VERIFYHOST,	0L);

    CURLcode res = curl_easy_perform(CURL_CTX);
    if (res != CURLE_OK)
        printf("[TRANS-CLI] - Request failed: %s\n", curl_easy_strerror(res));

    curl_slist_free_all(hdr);
	memset(buffer, 0, sizeof(buffer));
	
	curl_easy_reset(CURL_CTX);
	return ((int)res);
}

#include <string.h>

struct resp_buf {
    char *data;
    size_t len;
};

static size_t
write_cb(void *ptr, size_t size, size_t nmemb, void *userdata) {
    size_t total = size * nmemb;
    struct resp_buf *rb = userdata;
    rb->data = realloc(rb->data, rb->len + total + 1);
    memcpy(rb->data + rb->len, ptr, total);
    rb->len += total;
    rb->data[rb->len] = '\0';
    return total;
}

const char	*cli_cookie_get(void)
{
	static struct curl_slist	*cookies = NULL;

	if (!cookies)
		curl_easy_getinfo(CURL_CTX, CURLINFO_COOKIELIST, &cookies);
	if (!cookies)
		return (NULL);
	
	char	*end = cookies->data + strlen(cookies->data) - CLI_COOKIE_LEN;
	
	return (end);
}

int main(void)
{
	int		err = 0;
	char	buffer[1024] = {0};
	char	*hdr[] = {buffer, NULL};

	CURL_CTX = curl_easy_init();
    if(!CURL_CTX)
	{
        printf("[TRANS-CLI] - Curl init failed\n");
		goto defer;
	}
	curl_easy_setopt(CURL_CTX, CURLOPT_COOKIEFILE, "");
	curl_easy_setopt(CURL_CTX, CURLOPT_COOKIEJAR,  ".cookiejar");

	curl_easy_setopt(CURL_CTX,  CURLOPT_VERBOSE, 1L);
	curl_easy_setopt(CURL_CTX,  CURLOPT_TIMEOUT, 10L);

// 	strcat(buffer, AUTH_HEADER);
// 	strcat(buffer, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjcxMzc4Mjc5MzAwLCJpYXQiOjE3NDY3Mjc3NTcsImV4cCI6MTc0NjczMTM1N30.5zPomWBRuXkUEhIdwmWH0Df82xUaM6erCPdRvvV6Dc8");

	strcat(buffer, "Content-Type: application/json");

	struct resp_buf rb = { .data = NULL, .len = 0 };
    curl_easy_setopt(CURL_CTX, CURLOPT_WRITEFUNCTION, write_cb);
    curl_easy_setopt(CURL_CTX, CURLOPT_WRITEDATA, &rb);

	cli_request_send(CLI_POST, "auth/login", hdr, "{\"email\":\"sacha\",\"username\":\"sacha\",\"password\":\"12345678\"}");

	memset(buffer, 0, sizeof(buffer));
	strcat(buffer, AUTH_HEADER);
	strcat(buffer, cli_cookie_get());

	cli_request_send(CLI_GET, "users/@me", hdr, NULL);

	cli_request_send(CLI_GET, "auth/2fa/setup", NULL, NULL);
defer:
    curl_easy_cleanup(CURL_CTX);
	return (err);
}
