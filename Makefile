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

all: prod

prod:
	@bash -c 'cd front && npm i'
	@./script.sh
	@bash -c 'docker compose -f ./docker-compose.prod.yml up --build; status=$$?; if [ $$status -eq 130 ]; then exit 0; else exit $$status; fi'

dev:
	@./script.sh
	@bash -c 'docker compose -f ./docker-compose.dev.yml up --build; status=$$?; if [ $$status -eq 130 ]; then exit 0; else exit $$status; fi'

down:
	@printf "\n🔧 $(_GREEN)Down containers$(_RESET) 🔧\n\n"
	@docker compose -f ./docker-compose.dev.yml down

clean: down
	@rm -rf front/node_modules
	@printf "\n🔧 $(_GREEN)Delete front/node_modules/$(_RESET) 🔧\n\n"
	@rm -rf back/node_modules
	@printf "\n🔧 $(_GREEN)Delete back/node_modules/$(_RESET) 🔧\n\n"


fclean: down
	@printf "\n🔧 $(_GREEN)Delete containers images$(_RESET) 🔧\n\n"
	@docker system prune -af

re: fclean all

.PHONY:
	all up down clean fclean re
