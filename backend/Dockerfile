FROM golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/server ./cmd/server \
 && CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/migrate ./cmd/migrate

FROM alpine:3.23
RUN apk add --no-cache ca-certificates tzdata \
 && addgroup -g 10001 app && adduser -D -u 10001 -G app app
WORKDIR /app
COPY --from=build /out/ /app/
COPY migrations/ /app/migrations/
RUN mkdir /app/uploads && chown app:app /app/uploads
USER app
ENV TZ=Asia/Tehran
EXPOSE 8080
CMD ["/app/server"]
