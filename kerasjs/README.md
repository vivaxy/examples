# How to run

- `yarn install`
- Install keras
- Clone kerasjs into ./kerasjs
- Find images of dogs and not dogs, mark dog image name with 'dog', and not dog image name with 'not-dog'
- `cd training`
- `source ./bin/activate`
- `python ./train.py`
- You will see `dog.model` file
- `python ../kerasjs/inst/python/encoder.py dog.model`
- You will see `dog.bin` file
- `yarn build`
- `deactivate`
