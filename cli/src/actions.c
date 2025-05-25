/**
 * actions.c | Action functions
 */

#include <ui.h>

TCLI_API(select)(TCLI_Elem *elem)
{
	elem->colors[TCLI_IDX_BOX] = 0xf21212;
}

TCLI_API(deselect)(TCLI_Elem *elem)
{
	elem->colors[TCLI_IDX_BOX] = 0xc3c3c3;
}

