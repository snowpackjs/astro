FROM mcr.microsoft.com/devcontainers/javascript-node:1-18

# Install playwright
RUN npm install -g @playwright/test

# Install latest pnpm
RUN npm install -g pnpm

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && curl -sSL https://dl.google.com/linux/direct/google-chrome-stable_current_$(dpkg --print-architecture).deb -o /tmp/chrome.deb \
    && apt-get -y install /tmp/chrome.deb

COPY welcome-message.txt /usr/local/etc/vscode-dev-containers/first-run-notice.txt