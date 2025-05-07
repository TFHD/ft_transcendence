/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.c                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rgramati <rgramati@42angouleme.fr>         +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/05 21:12:12 by rgramati          #+#    #+#             */
/*   Updated: 2025/05/07 20:02:41 by rgramati         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/*
 *	CLI Transcendence application.
 */

#include <stdio.h>
#include <nopoll.h>

#define UNUSED	__attribute__((unused))

static void
on_message (UNUSED noPollCtx  *ctx,
            UNUSED noPollConn *conn,
            UNUSED noPollMsg  *msg,
            UNUSED void       *user_data)
{
    if (nopoll_msg_is_final (msg))
	{
        int  len     = nopoll_msg_get_payload_size (msg);
        const unsigned char *payload = nopoll_msg_get_payload (msg);

        char *text = malloc(len + 1);
        memcpy(text, payload, len);
        text[len] = '\0';

        printf("Received text: %s\n", text);
        free(text);
    }
}

int main(void)
{
	noPollCtx	*ctx = nopoll_ctx_new ();

	nopoll_log_enable(ctx, nopoll_true);

	if (! ctx)
	{
		printf("nopoll: context creation failed.\n");
		goto defer;
	}

	nopoll_ctx_set_on_msg(ctx, on_message, NULL);
	
	noPollConnOpts *opts = nopoll_conn_opts_new();

	nopoll_conn_opts_ssl_peer_verify(opts, nopoll_false);

	noPollConn	*conn = nopoll_conn_tls_new
	(
		ctx,
		opts,
		"localhost",
		"8000",
		NULL,
		"/api/pong/solo",
		NULL,
		"https://localhost:3000"
	);
	if (!nopoll_conn_is_ok(conn))
	{
		printf("nopoll: connection not OK...\n");
		goto defer;
	}
	
	int elapsed = 0;
	while (!nopoll_conn_is_ready(conn) && elapsed < 5000)
	{
		nopoll_loop_wait(ctx, 100);
		elapsed += 100;
	}
	if (!nopoll_conn_is_ready(conn))
	{
		printf("nopoll: handshake failed or timed out\n");
		goto defer;
	}

	if (nopoll_conn_send_text(conn, "{\"key\":\"w\", \"state\":true}", 25) != 25)
	{
		printf("nopoll: inequality in msg length.\n");
		goto defer;
	}

	printf("Message sent.\n");

    for (;;) {
      nopoll_loop_wait(ctx, 100);
    }

defer:
	nopoll_ctx_unref(ctx);
	return (0);
}
