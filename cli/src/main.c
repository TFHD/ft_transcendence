/*
 *	CLI Transcendence application.
 */

#include <transcendence.h>

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

# include <transcendence.h>

#define	TCLI_URL_BASE	"https://Trans/api/"

#define	AUTH_HEADER		"authorization: Bearer "

typedef enum e_cli_reqtype
{
	CLI_GET = 1,
	CLI_POST = 2,
	CLI_PATCH = 3,
	CLI_DELETE = 4,
}	cli_reqtype;

void	TCLI(render)(TCLI_SceneCtx *);

# define	UP_ARROW_SCAN		0x415b1b
# define	DOWN_ARROW_SCAN		0x425b1b
# define	RIGHT_ARROW_SCAN	0x435b1b
# define	LEFT_ARROW_SCAN		0x445b1b

void	TCLI(loop)(void)
{
    curl_easy_setopt(CURL_CTX, CURLOPT_WRITEFUNCTION, TCLI(curlCB));
    curl_easy_setopt(CURL_CTX, CURLOPT_WRITEDATA, &TCLI_CBSTR);

	TCLI_SceneCtx	*ctx	= NULL;
	TCLI_SCENE				= &TCLI(mainMenu);
	TCLI_STATUS				|= TCLI_SCENE_SWAP;

	printf("width = %u, height = %u\n", TCLI_WIDTH, TCLI_HEIGHT);

	while (TCLI_ACTIVE)
	{
		if (TCLI_SCENE)
			ctx = TCLI_SCENE();
		if (TCLI_STATUS & TCLI_SCENE_SWAP)
		{
			TCLI(screenClear)(&TCLI_SCREEN);
			TCLI(render)(ctx);
			TCLI_STATUS &= ~TCLI_SCENE_SWAP;
		}

		char	uchar[4] = {0};

#if 0
		write(STDERR_FILENO, "\033[0;0f", 6);
		write(STDERR_FILENO, TCLI_SCREEN.data,
			TCLI_SCREEN.width * TCLI_SCREEN.height * TCLI_CHAR_SIZE);
	
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
		if (uchar[0] == 9)
			uchar[0] = TCLI_ARROW_DOWN;

#if 1
		TCLI(handleKey)(ctx, uchar[0]);
		TCLI(screenClear)(&TCLI_SCREEN);
		TCLI(render)(ctx);
#endif

//  		TCLI_makeRequest(TCLI_POST | TCLI_REQ_LOGIN);
//  		TCLI_sendRequest();
// 		TCLI_handleAnswer();
//
// 		TCLI_STATUS &= ~TCLI_FLAG_OK;
	}
}

int main(int argc, char **argv)
{
	TCLI(init)(argc, argv);
	TCLI(loop)();
	TCLI(cleanup)();
}
