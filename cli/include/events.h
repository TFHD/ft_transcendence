/*
 *	events.h | X11 events.
 */

#ifndef		_EVENTS_H
# define	_EVENTS_H

# include <X11/Xlib.h>
# include <X11/keysym.h>

# include <types.h>
# include <context.h>
# include <ui.h>

struct _tcli_events
{
	Display	*display;
	Window	win;
	int		active;
};

typedef void (*TCLI_EventFunc)(TCLI_SceneCtx *, XEvent *);

TCLI_API(eventsHandle)
(TCLI_SceneCtx *ctx, TCLI_Events *events);

TCLI_API(eventsInit)
(TCLI_Events *events);

TCLI_API(eventsDestroy)
(TCLI_Events *events);
#endif		// _EVENTS_H
