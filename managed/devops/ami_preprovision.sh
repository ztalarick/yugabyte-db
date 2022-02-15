#!/bin/bash

yum install -y git
git clone https://github.com/yugabyte/yugabyte-db
yugabyte-db/managed/devops/bin/install_python_requirements.sh
yugabyte-db/managed/devops/bin/install_ansible_requirements.sh