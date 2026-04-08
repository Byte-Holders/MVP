ARG NODE_VERSION=24.11.1
FROM node:${NODE_VERSION}-alpine

COPY --from=anchore/syft:latest /syft /usr/local/bin/syft
COPY --from=anchore/grype:latest /grype /usr/local/bin/grype

WORKDIR /usr/src/app

#  Installazione Dipendenze di Sistema (Python & Semgrep) ---
RUN apk add --no-cache python3 py3-pip build-base python3-dev libffi-dev

# virtual environment per python
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

RUN pip install semgrep

COPY package*.json .

RUN npm install

RUN --mount=type=cache,target=/root/.npm\
    npm install -g @nestjs/cli

COPY . .

CMD ["npm", "run", "start"]
