/*
 *	events.c | X11 event window for scancodes.
 */

#include <events.h>

# define	UP_ARROW_SCAN		0x415b1b
# define	DOWN_ARROW_SCAN		0x425b1b
# define	RIGHT_ARROW_SCAN	0x435b1b
# define	LEFT_ARROW_SCAN		0x445b1b

char	TCLI_eventsGetKeychar(XEvent *event)
{
	KeySym keysym = XLookupKeysym(&event->xkey, 0);
	char keychar = -1;
	
	switch (keysym) {
		case XK_Return: keychar = '\n'; break;
		case XK_Escape: keychar = 27; break;
		case XK_BackSpace: keychar = 127; break;
		case XK_Tab: keychar = '\t'; break;
		case XK_Up: keychar = TCLI_ARROW_UP; break;
		case XK_Down: keychar = TCLI_ARROW_DOWN; break;
		case XK_Left: keychar = TCLI_ARROW_LEFT; break;
		case XK_Right: keychar = TCLI_ARROW_RIGHT; break;
		default:
			{
				char buffer[2] = {0};
				XComposeStatus status = {0};
				int count = XLookupString(&event->xkey, buffer, 1, NULL, &status);
				if (count == 1 && buffer[0] >= 32 && buffer[0] <= 126) {
					keychar = buffer[0];
				}
			}
			break;
	}
	return (keychar);
}

void	TCLI_eventsKeydown(TCLI_SceneCtx *ctx, XEvent *event)
{
	(void) ctx;
	char	keychar = TCLI_eventsGetKeychar(event);

	if (keychar != -1)
	{
		TCLI_handleKey(ctx, keychar);
		TCLI_KEYMAP[(int)keychar] = 1;
	}
}

void	TCLI_eventsKeyup(TCLI_SceneCtx *ctx, XEvent *event)
{
	(void) ctx;
	char	keychar = TCLI_eventsGetKeychar(event);
	
	if (keychar != -1)
		TCLI_KEYMAP[(int)keychar] = 0;
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
			0, 0, 1, 1, 0,
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
	{
		XFlush(events->display);
		
		XSync(events->display, True);
		
		XCloseDisplay(events->display);
		events->display = NULL;
	}
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
	}
}
