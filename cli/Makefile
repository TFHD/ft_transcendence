#
#	Transcendence CLI
#

NAME		=	trans-cli

SRC_DIR		:=	src
SRCS		:=	$(wildcard $(SRC_DIR)/*.c)

OBJ_DIR		:=	build
OBJS 		:=	$(addprefix $(OBJ_DIR)/, $(SRCS:%.c=%.o))

CC			:=	clang

CFLAGS		:=	-Wall -Wextra -g
IFLAGS		:=	-I include 						\
				-I ./include/nopoll				\
				-I ./include/curl				\
				-I ./include/cJSON				\

RM			:=	rm -rf

LIB_DIR		:= lib

#
# Rules
#

all:			check-libs $(NAME)

check-libs:
	@if [ -z "$$(ls -A lib 2>/dev/null)" ]; then \
		bash ./commands.sh; \
	fi

$(NAME):	 	$(OBJS)	
	@$(CC) $(CFLAGS) -save-temps $^ -L$(PWD)/lib -lnopoll -lcurl -lcjson -o $(NAME) $(IFLAGS) 

	@echo " $(GREEN)$(BOLD)$(ITALIC)■$(RESET)  building	$(GRAY)$(BOLD)$(ITALIC)$(NAME)$(RESET)"

$(OBJ_DIR)/%.o: %.c
	@mkdir -p $(@D)
	@echo " $(CYAN)$(BOLD)$(ITALIC)■$(RESET)  compiling	$(GRAY)$(BOLD)$(ITALIC)$(notdir $@)$(RESET) from $(GRAY)$(BOLD)$(ITALIC)$(notdir $^)$(RESET)"
	@$(CC) $(CFLAGS) $(IFLAGS) -o $@ -c $^

clean:
	echo " $(RED)$(BOLD)$(ITALIC)■$(RESET)  deleted	$(GRAY)$(BOLD)$(ITALIC)$(OBJS)$(RESET)"
	$(RM) $(OBJS)
	$(RM) $(OBJ_DIR)

fclean:			clean
	@echo " $(RED)$(BOLD)$(ITALIC)■$(RESET)  deleted	$(GRAY)$(BOLD)$(ITALIC)$(NAME)$(RESET)"
	$(RM) $(NAME)

cleandeps :
	$(RM) ./include/cjson ./include/cJSON ./include/curl ./include/nopoll ./lib/* ./share ./bin

re:			fclean all

.PHONY:		all clean fclean test re cleandeps
.SILENT:	all clean fclean test re cleandeps

#
# Ansi
# 

BOLD			=	\033[1m
ITALIC			=	\033[3m

RED				=	\033[31m
GREEN			=	\033[32m
YELLOW			=	\033[33m
CYAN			=	\033[36m

RESET			=	\033[0m

LINE_CLR		=	\33[2K\r
