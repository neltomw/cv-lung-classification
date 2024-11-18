# cv-lung-classification

Simple overview of use/purpose.

## Description
The goal of this project was to create a pixel by pixel image classification model using AWS Sagemaker and state of the art deep learning models. This model would be able to infer whether any given coordinate in a histological sample of a rat lung is an alveoli, septa or duct. 

Having an inference tool has many benefits, including reducing subjectivity of classification that may occur between different individual’s labelling. Instead, the classification model is trained off of labelling information provided by a single individual with assumed expertise.

Some other benefits include; efficiency with a high level of accuracy and precision.

### Model/hardware specs:
Pretrained ResNet-18 architecture with Adam optimizer and a mini-batch size of 32. The model is also leveraging MXNet as the deep learning framework, utilizing CUDA and GPU acceleration (specifically a Tesla K80 GPU).

## Getting Started

### Dependencies
* Node v18
* AWS account

### Getting Started
* Make sure NVM (Node Version Manager) is installed
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```
Running either of the above commands downloads a script and runs it. 
The script clones the nvm repository to ```~/.nvm```, and attempts to add the source lines from the snippet below to the correct profile file ```(~/.bash_profile, ~/.zshrc, ~/.profile, or ~/.bashrc)```

* Load nvm:
```
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" 
```

* Install nvm
```
nvm install 18
nvm use 18
```
### How to run
* Clone this repo:
```
git clone https://github.com/neltomw/cv-lung-classification-tool.git
cd cv-lung-classification-tool
```
* Enter your AWS credentials in App.js
const env = {
 "ACCESS_KEY": "*",
 "SECRET_KEY": "*",
 "REGION": "*"
};
