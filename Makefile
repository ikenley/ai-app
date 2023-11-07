# Start local dev dependencies
deps:
	docker-compose up -d db auth_api
	make migrate

# Start everything
start: 
	docker-compose up

down: 
	docker-compose down

migrate:
	docker-compose up flyway