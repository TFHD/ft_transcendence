/*
 *	events.c | X11 event window for scancodes.
 */

#include <events.h>

# define	UP_ARROW_SCAN		0x415b1b
# define	DOWN_ARROW_SCAN		0x425b1b
# define	RIGHT_ARROW_SCAN	0x435b1b
# define	LEFT_ARROW_SCAN		0x445b1b

void	TCLI_eventsKeydown(TCLI_SceneCtx *ctx, XEvent *event)
{
	KeySym keysym = XLookupKeysym(&event->xkey, 0);
	char keychar = -1;
	
	if (keysym >= XK_a && keysym <= XK_z) {
		keychar = (char)(keysym - XK_a + 'a');
	} else if (keysym >= XK_A && keysym <= XK_Z) {
		keychar = (char)(keysym - XK_A + 'A');
	} else if (keysym >= XK_0 && keysym <= XK_9) {
		keychar = (char)(keysym - XK_0 + '0');
	} else {
		switch (keysym) {
			case XK_space: keychar = ' '; break;
			case XK_Return: keychar = '\n'; break;
			case XK_Escape: keychar = 27; break;
			case XK_BackSpace: keychar = 127; break;
			case XK_Up: keychar = TCLI_ARROW_UP; break;
			case XK_Down: keychar = TCLI_ARROW_DOWN; break;
			case XK_Left: keychar = TCLI_ARROW_LEFT; break;
			case XK_Right: keychar = TCLI_ARROW_RIGHT; break;
		}
	}
	
	if (keychar != -1)
	{
		TCLI_handleKey(ctx, keychar);
		
		if (TCLI_STATUS & TCLI_PONG_GAME)
		{
			if (keychar == 'w')
			{
				strcat(TCLI_WSBUF_SEND, "{ \"key\": \"w\", \"state\":true}");
			}
			if (keychar == 's')
			{
				strcat(TCLI_WSBUF_SEND, "{ \"key\": \"s\", \"state\":true}");
			}
			if (TCLI_STATUS & TCLI_PONG_SOLO)
			{
				if (keychar == TCLI_ARROW_UP)
				{
					strcat(TCLI_WSBUF_SEND, "{ \"key\": \"ArrowUp\", \"state\":true}");
				}
				if (keychar == TCLI_ARROW_DOWN)
				{
					strcat(TCLI_WSBUF_SEND, "{ \"key\": \"ArrowDown\", \"state\":true}");
				}
			}
		}
	}
}

void	TCLI_eventsKeyup(TCLI_SceneCtx *ctx, XEvent *event)
{
	KeySym keysym = XLookupKeysym(&event->xkey, 0);
	char keychar = -1;
	
	if (keysym >= XK_a && keysym <= XK_z) {
		keychar = (char)(keysym - XK_a + 'a');
	} else if (keysym >= XK_A && keysym <= XK_Z) {
		keychar = (char)(keysym - XK_A + 'A');
	} else if (keysym >= XK_0 && keysym <= XK_9) {
		keychar = (char)(keysym - XK_0 + '0');
	} else {
		switch (keysym) {
			case XK_space: keychar = ' '; break;
			case XK_Return: keychar = '\n'; break;
			case XK_Escape: keychar = 27; break;
			case XK_BackSpace: keychar = 127; break;
			case XK_Up: keychar = TCLI_ARROW_UP; break;
			case XK_Down: keychar = TCLI_ARROW_DOWN; break;
			case XK_Left: keychar = TCLI_ARROW_LEFT; break;
			case XK_Right: keychar = TCLI_ARROW_RIGHT; break;
		}
	}
	
	if (keychar != -1)
	{
		if (TCLI_STATUS & TCLI_PONG_GAME)
		{
			if (keychar == 'w')
			{
				strcat(TCLI_WSBUF_SEND, "{ \"key\": \"w\", \"state\":false}");
			}
			if (keychar == 's')
			{
				strcat(TCLI_WSBUF_SEND, "{ \"key\": \"s\", \"state\":false}");
			}
			if (TCLI_STATUS & TCLI_PONG_SOLO)
			{
				if (keychar == TCLI_ARROW_UP)
				{
					strcat(TCLI_WSBUF_SEND, "{ \"key\": \"ArrowUp\", \"state\":false}");

				}
				if (keychar == TCLI_ARROW_DOWN)
				{
					strcat(TCLI_WSBUF_SEND, "{ \"key\": \"ArrowDown\", \"state\":false}");

				}
			}
		}
// 		TCLI_handleKeyRelease(ctx, keychar);
	}
}

void	TCLI_eventsInit(TCLI_Events *events)
{
	Window					root;
	XSetWindowAttributes	attr;

	events->display = XOpenDisplay(NULL);
	events->active = 0;
	
	if (events->display)
	{
		root = DefaultRootWindow(events->display);
		attr.override_redirect = 1;
		events->win = XCreateWindow(
			events->display, root,
			-1, -1, 1, 1, 0,
			CopyFromParent, InputOnly,
			CopyFromParent, CWOverrideRedirect, &attr
		);
		XSelectInput(
			events->display, events->win,
			KeyPressMask | KeyReleaseMask
		);
		XMapWindow(events->display, events->win);
		XSetInputFocus(events->display, events->win, RevertToParent, CurrentTime);
	}
}

void	TCLI_eventsDestroy(TCLI_Events *events)
{
	if (events->display)
		XCloseDisplay(events->display);
}

void	TCLI_eventsHandle(TCLI_SceneCtx *ctx, TCLI_Events *events)
{
	static const TCLI_EventFunc	eventHandlers[KeyRelease + 1] =
	{
		[KeyPress] = TCLI_eventsKeydown,
		[KeyRelease] = TCLI_eventsKeyup,
	};
	
	XEvent	event;
	
	events->active = 0;
	
	while (XPending(events->display))
	{
		XNextEvent(events->display, &event);
		if (eventHandlers[event.type]) {
			eventHandlers[event.type](ctx, &event);
			events->active = 1;
		}
		
		if (event.type == KeyPress && event.xkey.keycode == 9) {
			TCLI_STATUS &= ~TCLI_FLAG_OK;
		}
	}
}
