# cv-lung-classification
The goal of this portion of the project was to create an image classification model using AWS Sagemaker and state of the art deep learning models. This model would be able to infer whether any given coordinate in a histological sample of a rat lung is an alveoli, septa or duct. 

Having an inference tool has many benefits, including reducing subjectivity of classification that may occur between different individual’s labelling. Instead, the classification model is trained off of labelling information provided by a single individual with assumed expertise.

Some other benefits include; an efficient way to classify tissue components a high level of accuracy, consistency, low level of bias and without tying up human resources on a time consuming and tedious task.

Model/hardware specs:
Pretrained ResNet-18 architecture with Adam optimizer and a mini-batch size of 32. The model is also leveraging MXNet as the deep learning framework, utilizing CUDA and GPU acceleration (specifically a Tesla K80 GPU).
