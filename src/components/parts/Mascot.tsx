import { component$, noSerialize, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik"
import clsx from "clsx"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

import styles from "@/components/parts/Mascot.module.css"
import { isDefined } from "@/utils"

import type { NoSerialize } from "@builder.io/qwik"
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js"

/** Three.jsのオブジェクトをuseStoreで保持するための型 */
type ThreeObjects = {
  /** シーン */
  scene: NoSerialize<THREE.Scene>
  /** カメラ */
  camera: NoSerialize<THREE.PerspectiveCamera>
  /** レンダラー */
  renderer: NoSerialize<THREE.WebGLRenderer>
}

/** Props */
type Props = {
  /** 少し大きめに表示するかどうか */
  isLarger?: boolean
}

export default component$(({ isLarger = false }: Props) => {
  const canvasRef = useSignal<HTMLCanvasElement>()
  const threeObjects = useStore<ThreeObjects>({
    scene: noSerialize(undefined),
    camera: noSerialize(undefined),
    renderer: noSerialize(undefined)
  })

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300)
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.value,
      antialias: true
    })

    threeObjects.scene = noSerialize(scene)
    threeObjects.camera = noSerialize(camera)
    threeObjects.renderer = noSerialize(renderer)

    scene.background = new THREE.Color(0x212121)

    const dpr = window.devicePixelRatio ?? 1
    const pixelW = (isLarger ? 300 : 180) * dpr
    const pixelH = (isLarger ? 240 : 150) * dpr
    const initialCameraState = {
      position: {
        x: 1.1456670168700795,
        y: 1.107751436559273,
        z: 6.003011918787981
      },
      rotation: {
        x: -0.23618872974202768,
        y: 0.31244442876203626,
        z: 0.07384732780833957
      },
      quaternion: {
        x: -0.1106023788457152,
        y: 0.1586949560533934,
        z: 0.017892899696364754,
        w: 0.9809499828519985
      },
      target: {
        x: -0.7455560582958706,
        y: -0.26224856344072744,
        z: 0.3108285965195559
      }
    } as const
    camera.position.set(
      initialCameraState.position.x,
      initialCameraState.position.y,
      initialCameraState.position.z
    )
    camera.quaternion.set(
      initialCameraState.quaternion.x,
      initialCameraState.quaternion.y,
      initialCameraState.quaternion.z,
      initialCameraState.quaternion.w
    )
    camera.aspect = pixelW / pixelH
    camera.updateProjectionMatrix()

    renderer.setPixelRatio(dpr)
    renderer.setSize(pixelW, pixelH, false)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.render(scene, camera)

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
    scene.add(ambientLight)

    const spotLight = new THREE.SpotLight(0xffffff, 400)
    spotLight.position.set(5, 10, 5)
    spotLight.angle = Math.PI / 8
    spotLight.penumbra = 0.3
    spotLight.decay = 2
    spotLight.distance = 50
    spotLight.castShadow = true
    spotLight.shadow.camera.near = 0.5
    spotLight.shadow.camera.far = 50
    spotLight.shadow.focus = 1
    scene.add(spotLight)
    scene.add(spotLight.target)

    const planeGeometry = new THREE.PlaneGeometry(20, 20)
    const planeMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      side: THREE.DoubleSide
    })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.rotation.x = -Math.PI / 2
    plane.position.y = -1
    plane.receiveShadow = true
    scene.add(plane)

    const gltfLoader = new GLTFLoader()
    const gltfPath = "/mascot/scene.gltf"

    let model: THREE.Object3D | undefined

    gltfLoader.load(gltfPath, (gltf: GLTF) => {
      model = gltf.scene

      model.position.set(0, 1, 0)
      model.scale.set(0.9, 0.9, 0.9)

      model.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      scene.add(model)

      const targetBox = new THREE.Box3().setFromObject(model)
      const targetCenter = targetBox.getCenter(new THREE.Vector3())
      spotLight.target.position.copy(targetCenter)
    })

    const clock = new THREE.Clock()

    /** アニメーションループ */
    const animate = (): void => {
      requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()

      if (isDefined(model)) {
        model.position.y = 1 + Math.sin(elapsedTime * 2) * 0.05
      }

      renderer.render(scene, camera)
    }

    animate()
  })

  return <canvas ref={canvasRef} class={clsx(styles.canvasElement, isLarger && styles.Larger)} />
})
