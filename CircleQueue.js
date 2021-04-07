// 默认容量
const DefaultCapacity = 100

/**
 * CircleQueue
 *
 * @param capacity number 队列容量
 * @param useQueueFullAction boolean 队列满时，是否启用策略函数
 * @param onQueueFullAction func 队列满时，需要做的策略函数
 * @constructor
 */
function CircleQueue(
  capacity,
  useQueueFullAction = false,
  onQueueFullAction = null
) {
  this.queue = new Array(capacity || DefaultCapacity) // 队列数组
  this.queueCapacity = capacity || DefaultCapacity // 队列容量
  this.queueHead = 0 // 队头
  this.queueTail = 0 // 队尾
  this.queueLength = 0 // 队列长度
  this.useQueueFullAction = useQueueFullAction
  this.onQueueFullAction = onQueueFullAction || DefaultFullActionFunc
}

// 默认的队满策略，从队头删除10%的队列元素
function DefaultFullActionFunc() {
  let deqLength = parseInt(this.queueCapacity / 10)
  let deleteItems = this.deQueue(deqLength === 0 ? 1 : deqLength)
  console.log(
    "队列已满，执行默认策略，从队头删除10%的队列元素，deleteItems",
    deleteItems
  )
}

// 清空队列
CircleQueue.prototype.clearQueue = function clearQueue() {
  this.queueHead = 0
  this.queueTail = 0
  this.queueLength = 0
  console.log("清空队列")
}

// 销毁队列
CircleQueue.prototype.destroyQueue = function destroyQueue() {
  this.clearQueue()
  this.queue.splice(0, this.queue.queueLength) // 删除数组中所有元素
  this.queue = null // 地址的引用置为空
  console.log("销毁队列")
}

// 判断队列是否为满
CircleQueue.prototype.isFull = function isFull() {
  return this.queueLength === this.queueCapacity
}

// 判断队列是否为空
CircleQueue.prototype.isEmpty = function isEmpty() {
  return this.queueLength === 0
}

// 获取队列长度
CircleQueue.prototype.getLength = function getLength() {
  return this.queueLength
}

// 队列剩余容量
CircleQueue.prototype.remainCap = function remainCap() {
  return this.queueCapacity - this.queueLength
}

// 入队
CircleQueue.prototype.enQueue = function enQueue(elements) {
  // 如果队满, 判断是否执行策略
  if (this.isFull()) {
    if (this.useQueueFullAction) this.onQueueFullAction()
    else {
      console.log("入队失败，队列已满 入队元素为 element = " + elements)
      return false
    }
  }
  if(elements.length > this.queueCapacity){
    console.log("入队数量超出容量，入队数量："+ elements.length + "，队列容量：" + this.queueCapacity )
    return false
  }

  if (Array.isArray(elements)) {
    if (elements.length > this.remainCap()) {
      console.log("超出剩余容量, 入队数量：" + elements.length +"，剩余容量： " +this.remainCap())
      // todo: 删除到可入队的数量?
      this.deQueue(elements.length - this.remainCap())
    }
    let distanceToEnd = this.queueCapacity - this.queueTail
    if (this.queueHead <= this.queueTail && elements.length > distanceToEnd) {
      this.queue.splice(
        this.queueTail,
        distanceToEnd,
        elements.slice(0, distanceToEnd)
      )
      this.queue.splice(
        0,
        elements.length - distanceToEnd,
        elements.slice(distanceToEnd)
      )
    } else this.queue.splice(this.queueTail, elements.length, ...elements)

    this.queueTail += elements.length
    this.queueTail %= this.queueCapacity
    this.queueLength += elements.length

  } else {
    this.queue[this.queueTail] = elements
    this.queueTail++
    this.queueTail %= this.queueCapacity // 要对队列容量做取余操作，才能实现环形队列
    this.queueLength++
  }
  return true
}

/** 出队
 * @param deqLength 需要出队的数量，默认是1
 */
CircleQueue.prototype.deQueue = function deQueue(deqLength = 1) {
  // 如果队空, return false
  if (this.isEmpty()) {
    console.log("队列为空")
    return []
  }

  if (deqLength <= 0) {
    console.log("出队数量无效，", deqLength)
    return []
  }

  // 超出数量则返回已有的全部
  deqLength = deqLength > this.queueLength ? this.queueLength : deqLength

  let elements
  if (
    this.queueTail <= this.queueHead &&
    deqLength > this.queueCapacity - this.queueHead
  ) {
    elements = this.queue.slice(
      this.queueHead,
      this.queueCapacity - this.queueHead
    )
    elements.splice(
      elements.length,
      0,
      ...this.queue.slice(0, deqLength - elements.length)
    )
  } else {
    elements = this.queue.slice(this.queueHead, deqLength)
  }

  this.queueHead += deqLength
  this.queueHead %= this.queueCapacity // 要对队列容量做取余操作，才能实现环形队列
  this.queueLength -= deqLength
  return elements
}

/** 遍历队列
 * @param onHandleFunc 定义对元素的处理
 */
CircleQueue.prototype.traverseQueue = function traverseQueue(onHandleFunc) {
  for (let i = this.queueHead; i < this.queueHead + this.queueLength; i++) {
    let element = this.queue[i % this.queueCapacity]
    onHandleFunc(element)
  }
}

export default CircleQueue
