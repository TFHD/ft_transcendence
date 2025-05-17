/*
 *	CLI Transcendence application.
 */


#include <transcendence.h>

CURL	*__curl_ctx	= NULL;
TCLI	*__TCLI_ctx	= NULL;

char	__TCLI_tmp[1024]	= {0};

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


// #include <stdio.h>
// #include <nopoll.h>
// #include <curl.h>
// #include <cJSON.h>
// 
// #define	CLI_URL			"https://10.12.1.1:8000/api/"
// 
// #define	AUTH_HEADER		"authorization: Bearer "
// 
// typedef enum e_cli_reqtype
// {
// 	CLI_GET = 1,
// 	CLI_POST = 2,
// 	CLI_PATCH = 3,
// 	CLI_DELETE = 4,
// }	cli_reqtype;
// 
// 
// int	cli_request_send(cli_reqtype type, const char *endpoint, char **headers, char *post)
// {
// 	char				buffer[512] = {0};
// 	struct curl_slist	*hdr = NULL;
// 
// 	strcat(buffer, CLI_URL);
// 	strcat(buffer, endpoint);
// 
// 	while (headers && *headers)
// 		hdr = curl_slist_append(hdr, *headers++);
// 
// 	curl_easy_setopt(CURL_CTX, CURLOPT_HTTPHEADER,		hdr);
//     curl_easy_setopt(CURL_CTX, CURLOPT_URL,				buffer);
// 
// 	if (type == CLI_POST)
// 		curl_easy_setopt(CURL_CTX, CURLOPT_POSTFIELDS,	post);
// 
// 
//     CURLcode res = curl_easy_perform(CURL_CTX);
//     if (res != CURLE_OK)
//         printf("[TRANS-CLI] - Request failed: %s\n", curl_easy_strerror(res));
// 
//     curl_slist_free_all(hdr);
// 	memset(buffer, 0, sizeof(buffer));
// 	
// 	curl_easy_reset(CURL_CTX);
// 	return ((int)res);
// }
// 
// #include <string.h>
// 
// struct resp_buf {
//     char *data;
//     size_t len;
// };
// 

// 
// int main2(void)
// {
// 	int		err = 0;
// 	char	buffer[1024] = {0};
// 	char	*hdr[] = {buffer, NULL};
// 
// 	CURL_CTX = curl_easy_init();
//     if(!CURL_CTX)
// 	{
//         printf("[TRANS-CLI] - Curl init failed\n");
// 		goto defer;
// 	}
// 
// 


// 	cli_request_send(CLI_GET, "users/@me", hdr, NULL);
// 
// 	cli_request_send(CLI_GET, "auth/2fa/setup", NULL, NULL);
// defer:
//     curl_easy_cleanup(CURL_CTX);
// 	return (err);
// }

void	TCLI_FUNC(changeScene)(TCLI_SceneCtx *ctx)
{
	TCLI_Elem	*current = ctx->select;
	TCLI_Scene	new = current->slink;

	if (new)
	{
		TCLI_SCENE = new;
		TCLI_STATUS |= TCLI_SCENE_SWAP;
	}
}

void	TCLI_FUNC(handleJump)(TCLI_SceneCtx *ctx, char key)
{
	TCLI_Elem	*current = ctx->select;
	TCLI_Elem	*next = current->nexts[(int)key];

	if (!next)
		return ;

	current->onDeselect(&current->h);

	if (next == (void *)TCLI_ELEM_LAST)
	{
		if (!ctx->last)
			return ;
		ctx->select = ctx->last;
		next = ctx->select;
	}
	else
		ctx->select = next;
	ctx->last = current;

	next->onSelect(&next->h);
}

void	TCLI_FUNC(handleInput)(TCLI_SceneCtx *ctx, char key)
{
	(void) ctx;
	(void) key;

	TCLI_Elem	*current = ctx->select;

	if (current->h.type == TCLI_ELEM_TEXTBOX)
	{
		uint32_t	len = strlen(current->input);
		if (len >= 15)
			return ;
		current->input[len] = key;
	}
}

void	TCLI_FUNC(handleKey)(TCLI_SceneCtx *ctx, char key)
{
	if (key < 4)
		TCLI_handleJump(ctx, key);
	else if (key == '\n')
		TCLI_changeScene(ctx);
	else
		TCLI_handleInput(ctx, key);
}

void	TCLI_FUNC(render)(TCLI_SceneCtx *);

# define	UP_ARROW_SCAN		0x415b1b
# define	DOWN_ARROW_SCAN		0x425b1b
# define	RIGHT_ARROW_SCAN	0x435b1b
# define	LEFT_ARROW_SCAN		0x445b1b

void	TCLI_FUNC(loop)(void)
{
	static TCLI_buff	buff_cb = (TCLI_buff)
	{
		.data = NULL,
		.len = 0
	};
    curl_easy_setopt(CURL_CTX, CURLOPT_WRITEFUNCTION, TCLI_curlCB);
    curl_easy_setopt(CURL_CTX, CURLOPT_WRITEDATA, &buff_cb);

	TCLI_SceneCtx	*ctx	= NULL;
	TCLI_SCENE				= &TCLI_debugPage;
	TCLI_STATUS				|= TCLI_SCENE_SWAP;

	printf("width = %u, height = %u\n", TCLI_WIDTH, TCLI_HEIGHT);

	while (TCLI_ACTIVE)
	{
		if (TCLI_SCENE)
			ctx = TCLI_SCENE();
		if (TCLI_STATUS & TCLI_SCENE_SWAP)
		{
			screen_clear(&TCLI_SCREEN);
			TCLI_render(ctx);
			TCLI_STATUS &= ~TCLI_SCENE_SWAP;
		}

		char	uchar[4] = {0};

#if 1
		write(STDOUT_FILENO, "\033[0;0f", 6);
		write(STDOUT_FILENO, TCLI_SCREEN.data,
			TCLI_SCREEN.width * TCLI_SCREEN.height * SCREEN_CHAR_SIZE);
	
#endif

		int r = read(STDIN_FILENO, uchar, 4);
		if (r == 0)
			continue ;
		if (uchar[0] == 27)
		{
			if (uchar[1] == 0)
				break ;
			int	chars = *(int *)uchar;
			if (chars == UP_ARROW_SCAN)
				uchar[0] = TCLI_ARROW_UP;
			if (chars == DOWN_ARROW_SCAN)
				uchar[0] = TCLI_ARROW_DOWN;
			if (chars == RIGHT_ARROW_SCAN)
				uchar[0] = TCLI_ARROW_RIGHT;
			if (chars == LEFT_ARROW_SCAN)
				uchar[0] = TCLI_ARROW_LEFT;
		}

#if 1
		TCLI_handleKey(ctx, uchar[0]);
		TCLI_render(ctx);
#endif

//  		TCLI_makeRequest(TCLI_POST | TCLI_REQ_LOGIN);
//  		TCLI_sendRequest();
// 		TCLI_handleAnswer();
//
// 		TCLI_STATUS &= ~TCLI_FLAG_OK;
	}

	free(buff_cb.data);
}

int main(int argc, char **argv)
{
	TCLI_init(argc, argv);
	TCLI_loop();
	TCLI_cleanup();
}
