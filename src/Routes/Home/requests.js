import AuthClass from "../../TopLevel/Auth/Class";
import createGetOptions from "../../Utils/FetchOptions/Get";
import createPostOptions from "../../Utils/FetchOptions/Post";

export async function getNotes() {
  const id = AuthClass.getUser()._id;
  const url = `/api/note/user/${id}`;
  const options = createGetOptions();
  let notes = await fetch(url, options);
  // TODO: handle error
  notes = await notes.json();
  if (!notes.error) {
    return notes;
  }
}

export async function getImages() {
  const id = AuthClass.getUser()._id;
  let url = `/api/image/${id}`;
  let options = createGetOptions();
  let images;
  try {
    images = await fetch(url, options);
  } catch (error) {
    // TODO: handle this
  }
  images = await images.json();

  const finalArray = [];
  options = createGetOptions(null, "blob");
  for (let i = 0; i < images.length; i++) {
    const currentImg = images[i];
    const idx = images[i].imgId;
    url = `/api/image/user/${idx}`;
    let image;
    try {
      image = await fetch(url, options);
    } catch (error) {
      // TODO: handle errorrrrrr
    }
    image = await image.blob();
    image = URL.createObjectURL(image);
    finalArray.push({
      src: image,
      _id: idx,
      width: currentImg.width,
      height: currentImg.height,
      inTree: currentImg.inTree,
    });
  }
  return finalArray;
}

export async function getMindMapTreeData() {
  const user = AuthClass.getUser();
  const id = user._id;
  const currentSubject = user.currentSubject;
  const url = `/api/tree/${id}/${currentSubject}`;
  const options = createGetOptions();
  let tree = await fetch(url, options);
  // TODO: handle error
  try {
    tree = await tree.json();
  } catch (error) {
    console.log("within fetching tree by id, there is no tree!", error);
    return {
      chi: [
        {
          id: "0",
          radius: 12,
          depth: 0,
          jsx: null,
        },
      ],
      links: [],
    };
  }
  if (!tree.error) {
    return tree;
  }
}

export async function getSubject(subjectId) {
  const url = `/api/subject/${subjectId}`;
  const getOptions = createGetOptions();
  let subject;
  try {
    subject = await fetch(url, getOptions);
  } catch (error) {
    console.log("within fetching subject by id", error);
  }
  try {
    subject = await subject.json();
  } catch (error) {
    console.log("within fetching subject by id, there is no subject!", error);
    return { name: "", _id: null };
  }
  return subject;
}

export function organiseSubjects({ subjects, currentSubject }) {
  const firstSubject = subjects.filter(({ _id }) => currentSubject === _id);
  const otherSubjects = subjects.filter(({ _id }) => currentSubject !== _id);
  const organisedSubjects = firstSubject.concat(otherSubjects);
  return organisedSubjects;
}

export async function getSubjects(currentSubject, userId) {
  const url = `/api/subject/user/${userId}`;
  const getOptions = createGetOptions();
  let subjects;
  try {
    subjects = await fetch(url, getOptions);
    subjects = await subjects.json();
  } catch (error) {
    console.log("within fetching subjects", error);
  }
  const organisedSubjects = organiseSubjects({
    subjects,
    currentSubject,
  });
  return organisedSubjects;
}

export async function updateFolder(treeData, hooks, type) {
  const t = type === "notes" ? "note" : "image";
  let req;
  let data;
  if (type === "notes") {
    req = await getNotes();
    data = req[req.length - 1];
  } else {
    req = await getImages();
    data = req[req.length - 1];
  }
  // const node = createTreeNode({
  //   i: Math.random() * 10,
  //   id: data._id || data.id,
  //   idx: data._id || data.id,
  //   data: data,
  //   type: t,
  //   hooks,
  // });
  let notesMap = treeData.data[0],
    imagesMap = treeData.data[1];
  // if (type === "notes") {
  //   notesMap.childNodes.push(node);
  // } else {
  //   imagesMap.childNodes.push(node);
  // }
  hooks.setTreeData({
    ...treeData,
    data: [notesMap, imagesMap],
  });
}

export async function getNote(id) {
  const url = `/api/note/${id}`;
  const options = createGetOptions();
  let note;
  try {
    note = await fetch(url, options);
    note = await note.json();
  } catch (error) {
    console.log("error in trying to get a note by id", error);
  }
  return note;
}
export async function getImage(id) {
  const url = `/api/image/${id}`;
  const options = createGetOptions();
  let image;
  try {
    image = await fetch(url, options);
    image = await image.json();
  } catch (error) {
    console.log("error in trying to get a image by id", error);
  }
  return image;
}

async function updateData(type, id, inTree) {
  const obj = { inTree };
  const url = `/api/${type}/tree/${id}`;
  const options = createPostOptions(obj, "PUT");
  let data;
  try {
    data = await fetch(url, options);
    data = await data.json();
  } catch (error) {
    console.log(`error in trying to get a ${type} by id`, error);
  }
  return data;
}

// https://stackoverflow.com/questions/22222599/javascript-recursive-search-in-json-object
export function findNode(id, currentNode, parent = {}, returnParent = false) {
  let i, currentChild, result;
  console.log(id, currentNode)
  if (id === currentNode.id) {
    if (returnParent) return parent;
    return currentNode;
  } else {
    // Use a for loop instead of forEach to avoid nested functions
    // Otherwise "return" will not work properly
    for (i = 0; i < currentNode.childNodes.length; i++) {
      currentChild = currentNode.childNodes[i];
      // Search in the current child
      result = findNode(id, currentChild, currentNode, returnParent);

      // Return the result if the node has been found
      if (result !== false) {
        return result;
      }
    }

    // The node has not been found and we have no more options
    return false;
  }
}

export async function updateTree(tree, id) {
  const url = `/api/tree/${id}`;
  const options = createPostOptions(tree, "PUT");
  let data;
  try {
    data = await fetch(url, options);
    data = await data.json();
  } catch (error) {
    console.log(`error in trying to get a tree by id and update it`, error);
  }
  return JSON.parse(data.structure);
}

export async function updateInTree(id, inTree) {
  let data, type;
  data = await updateData("note", id, inTree);
  if (data.error) {
    type = "image";
    data = await updateData("image", id, inTree);
  } else type = "note";
  return [data, type];
}

export async function removeFromTree(id, changeData) {
  // First get tree and update tree structure (remove node or nodes)
  const tree = await getMindMapTreeData();
  const structure = JSON.parse(tree.structure);
  
  const node = findNode(id, structure[0], {}, true);
  console.log(node)
  const removedNode = node.childNodes.find(n => n.id === id);
  const data = [];
  // Update node and its children (if it has children) (inTree -> false)
  // update possible children
  for (let i = 0; i < removedNode.childNodes.length; i++) {
    const n = removedNode.childNodes[i];
    data.push(await updateInTree(n.id, false));
  }
  // update definite node
  data.push(await updateInTree(removedNode.id, false))
  node.childNodes = node.childNodes.filter(n => n.id !== id);
  const updatedStructure = await updateTree(structure, tree._id);
  changeData({ updateTree: true, data, structure: updatedStructure });
}
