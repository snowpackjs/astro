FROM mcr.microsoft.com/devcontainers/javascript-node:1-18

# Install latest pnpm
RUN npm install -g pnpm

COPY example-welcome-message.txt /usr/local/etc/vscode-dev-containers/first-run-notice.txt