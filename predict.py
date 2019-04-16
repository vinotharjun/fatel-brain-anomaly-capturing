
# coding: utf-8

# In[14]:


from keras.models import model_from_json
json_file = open('model.json', 'r')
loaded_model_json = json_file.read()
json_file.close()
model = model_from_json(loaded_model_json)
# load weights into new model
model.load_weights("model.h5")
print("Loaded model from disk")


# In[12]:


import cv2
import matplotlib.pyplot as plt


# In[16]:


anomaly="./Brain/Anomaly/xyz_a2779_35c.jpg"
normal="./Brain/Normal/xyz_a8458_16a.jpg"
image_input_dir=input("enter the image input directory to predict")
image_array=cv2.imread(image_input_dir,cv2.IMREAD_GRAYSCALE)
       
IMG_SIZE=28
new_array = cv2.resize(image_array, (IMG_SIZE, IMG_SIZE))
plt.imshow(new_array, cmap='gray') 
print(new_array.shape)
#plt.show()
new_array=new_array/255  
new_array=new_array.reshape(1,new_array.shape[0],new_array.shape[1])
# print(model.predict_classes(new_array)[0][0])
if model.predict_classes(new_array)[0][0]==0:
    print("the fatal brain is anomaly")
else:
    print("the fatal brain is normal condition")


# In[18]:


# import tensorflowjs as tfjs


# In[ ]:


# get_ipython().system('pip install tensorflowjs')

