TPUT	= tput -T xterm-256color
_RESET	= $(shell $(TPUT) sgr0)
_BOLD	= $(shell $(TPUT) bold)
_ITALIC	= $(shell $(TPUT) sitm)
_UNDER	= $(shell $(TPUT) smul)
_GREEN	= $(shell $(TPUT) setaf 2)
_YELLOW	= $(shell $(TPUT) setaf 3)
_RED	= $(shell $(TPUT) setaf 1)
_GRAY	= $(shell $(TPUT) setaf 8)
_PURPLE	= $(shell $(TPUT) setaf 5)
_BLUE	= $(shell $(TPUT) setaf 26)

all: up

up:
	@./script.sh
	@docker compose -f ./docker-compose.yml up --build

down:
	@printf "\n🔧 $(_GREEN)Down containers$(_RESET) 🔧\n\n"
	@docker compose -f ./docker-compose.yml down

clean: down
	@printf "\n🔧 $(_GREEN)Delete data$(_RESET) 🔧\n\n"


fclean: clean
	@printf "\n🔧 $(_GREEN)Delete containers images$(_RESET) 🔧\n\n"
	@docker system prune -af

re: fclean all

.PHONY:
	all up down clean fclean re
