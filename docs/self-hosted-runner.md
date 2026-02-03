# Self-hosted GitHub Actions Runner for Azure App Service deployments 🚀

This guide shows how to create a self-hosted GitHub Actions runner in Azure (Ubuntu VM) so deployments can reach network-restricted App Services (Private Endpoints / Access Restrictions).

---

## Overview

- Problem: GitHub-hosted runners can't reach App Service instances that are secured by Private Endpoints or strict access restrictions (HTTP 403 on deploy). 
- Solution: Create a VM in the same Virtual Network or with network access to the App Service, install a GitHub self-hosted runner, and label it (e.g., `self-hosted`, `linux`) so workflows can target it.

---

## Prerequisites

- Azure subscription and privileges to create VMs and join VNets
- GitHub repo admin access to register a self-hosted runner and add repository secrets
- Basic Linux familiarity (Ubuntu)

---

## Quick steps (summary)

1. Create an Ubuntu VM in the same VNet/subnet as your App Service (or with line-of-sight to it).
2. Install Node 18, npm, and Azure CLI on the VM.
3. Register a GitHub self-hosted runner on the VM and add `self-hosted` and `linux` labels.
4. Start the runner as a service so it persists across reboots.
5. Set the repository secret `USE_SELF_HOSTED=true` (optional gating mechanism used in the provided workflow). 

---

## Detailed setup

### 1) Create a VM (example with Azure CLI)

Adjust the parameters to your resource group, VNet, subnet and naming conventions:

```bash
az vm create \
  --resource-group myResourceGroup \
  --name gha-runner-vm \
  --image UbuntuLTS \
  --size Standard_B1ms \
  --admin-username azureuser \
  --generate-ssh-keys \
  --vnet-name myVnet \
  --subnet mySubnet
```

Make sure the VM is placed into a network that can reach your App Service (same VNet or peered VNet). Configure network security group rules to allow outbound HTTPS.

### 2) Install runtime tools on the VM

SSH into the VM and run:

```bash
# Node 18 + npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get update && sudo apt-get install -y nodejs build-essential

# Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# (Optional) unzip, zip tools
sudo apt-get install -y zip unzip
```

### 3) Register the GitHub Actions runner

- In GitHub: Repository → Settings → Actions → Runners → Add runner → Linux → follow the registration steps.
- The portal will show a set of commands (download, extract, config). Example:

```bash
# on the VM
mkdir actions-runner && cd actions-runner
# download the runner (replace version with the current one shown in Github)
wget https://github.com/actions/runner/releases/download/v2.308.0/actions-runner-linux-x64-2.308.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.308.0.tar.gz

# register the runner (you will paste the token provided by GitHub)
./config.sh --url https://github.com/<owner>/<repo> --token <TOKEN> --labels self-hosted,linux

# install as service
sudo ./svc.sh install
sudo ./svc.sh start
```

Now the runner should appear under your repository's **Settings → Actions → Runners** with the `self-hosted` and `linux` labels.

### 4) (Recommended) Harden the VM

- Keep the VM patched and limit incoming access (SSH via jump box, private IP only, or just disable public SSH). 
- Consider using a managed identity and limiting secrets on the runner.

### 5) Toggle usage in CI

- Set a repository secret: `USE_SELF_HOSTED` = `true` (or set it to `false` to keep using GitHub runners).
- The workflow in this repo includes a job that runs only when `USE_SELF_HOSTED` == `true`. Setting the secret to `true` will cause the self-hosted job to run.

---

## Notes

- If your App Service has Private Endpoint, ensure the VM is in a network that can resolve the private endpoint DNS and route traffic inside the VNet.
- If you need multiple runners for scale or HA, create additional VMs and register them with the same labels.

---

If you'd like, I can also provide an ARM template or Terraform example to spin up the VM and join the VNet automatically. ✅
