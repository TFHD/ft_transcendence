/**
 * actions.c | Action functions
 */

#include <ui.h>

TCLI_API(select)(TCLI(Elem) *elem)
{
	elem->colors[TCLI_IDX_BOX] = 0xf21212;
}

TCLI_API(deselect)(TCLI(Elem) *elem)
{
	elem->colors[TCLI_IDX_BOX] = 0xc3c3c3;
}

