#!/bin/bash

sudo yum install -y git postgresql-devel openldap-devel python3 gcc python3-devel
git clone https://github.com/yugabyte/yugabyte-db
set -x
export USER=root
yugabyte-db/managed/devops/bin/install_python_requirements.sh
yugabyte-db/managed/devops/bin/install_ansible_requirements.sh