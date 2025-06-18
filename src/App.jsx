import { useEffect, useState } from 'react'
import './App.css'
import { Button, Col, ConfigProvider, Divider, Form, Input, InputNumber, Layout, message, Row, Select, Spin, theme } from 'antd'
import axios from 'axios'
import { dataValid, formatterDiskon, formatterRupiah, inputNumberProps, parserDiskon, parserRupiah, selectCommonProps } from './utils/formatUtils'
const { TextArea } = Input;

function App() {
  const api = axios.create({
    baseURL: '/api',
  });

  const [form] = Form.useForm();
  const [loadingNegara, setLoadingNegara] = useState(true)
  const [listNegara, setListNegara] = useState([])
  const [listPelabuhan, setListPelabuhan] = useState([])
  const [listBarang, setListBarang] = useState([])
  const [selectedBarang, setSelectedBarang] = useState('')




  useEffect(() => {
    api.get(`/negaras`)
      .then((data) => {
        const options = data.data.filter((item) => (dataValid(item.nama_negara) && item.nama_negara != "string"))
          .map((item) => (
            {
              label: item.kode_negara + ' - ' + item.nama_negara,
              value: item.id_negara
            }
          ))
        setListNegara(options)
        setLoadingNegara(false)
      }).catch((err) => {
        message.error('Error Get Data')
        setLoadingNegara(false)
      })
  }, [])

  useEffect(() => {
    form.setFieldsValue(
      {
        deskripsi: selectedBarang?.description || '',
        harga: selectedBarang?.harga || '',
        diskon: selectedBarang?.diskon || ''
      });

    calculateTotal()
  }, [selectedBarang]);

  const resetData = (keyData) => {
    if (keyData == 'barang') {
      form.setFieldsValue({ barang: null });
    }
    else {
      form.setFieldsValue({
        pelabuhan: null,
        barang: null,
      });
    }
    setSelectedBarang('')
  }

  const updateListPelabuhan = (idNegara) => {
    resetData('pelabuhan')
    const filter = JSON.stringify({ where: { id_negara: idNegara } });

    api.get(`/pelabuhans`, { params: { filter } })
      .then((data) => {
        const options = data.data.map((item) => (
          {
            label: item.nama_pelabuhan,
            value: item.id_pelabuhan
          }
        ))
        setListPelabuhan(options)
      })
  }

  const updateListBarang = (idPelabuhan) => {
    resetData('barang')
    const filter = JSON.stringify({ where: { id_pelabuhan: idPelabuhan } });

    api.get(`/barangs`, { params: { filter } })
      .then((data) => {
        const options = data.data.map((item) => (
          {
            label: item.id_barang + ' - ' + item.nama_barang,
            value: item.id_barang,
            detail: item
          }
        ))
        setListBarang(options)
      })
  }

  const calculateTotal = () => {

    let diskon = +form.getFieldValue('diskon')
    let harga = +form.getFieldValue('harga')

    const total = harga - (harga * diskon / 100)
    form.setFieldsValue({ total: total.toFixed(2) })
  }


  const handleSubmit = () => {
    form.setFieldsValue({ diskon: null, harga: null })
    form.resetFields();
    message.success('Order diproses')
  }

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handleChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);


  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div
        style={{
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Row gutter={[16, 16]} className='form-order'>
          <Col xs={0} md={12} className='form-img'> </Col>
          <Col xs={24} md={12} className='form-data'>
            {loadingNegara ? <Divider orientation="center"><Spin tip="Loading..." /></Divider> :
              <Form
                form={form}
                requiredMark
                name="login"
                initialValues={{
                  remember: true,
                }}
                size="medium"
                layout="vertical"
                onFinish={handleSubmit}
              >
                <Form.Item
                  name="negara"
                  label="Negara"
                  rules={[
                    {
                      required: true,
                      message: "Tolong pilih negara!",
                    },
                  ]}
                  style={{ marginBottom: "1rem" }}
                >
                  <Select
                    {...selectCommonProps}
                    loading={loadingNegara}
                    placeholder="Pilih Negara"
                    options={listNegara}
                    onChange={(value) => updateListPelabuhan(value)}
                  />
                </Form.Item>
                <Form.Item
                  name="pelabuhan"
                  label="Pelabuhan"
                  rules={[
                    {
                      required: true,
                      message: "Tolong pilih pelabuhan!",
                    },
                  ]}
                  style={{ marginBottom: "1rem" }}
                >
                  <Select
                    {...selectCommonProps}
                    disabled={!form.getFieldValue('negara')}
                    placeholder="Pilih Pelabuhan"
                    options={listPelabuhan}
                    onChange={(value) => updateListBarang(value)}
                  />
                </Form.Item>

                <Form.Item
                  name="barang"
                  label="Barang"
                  rules={[
                    {
                      required: true,
                      message: "Tolong pilih barang!",
                    },
                  ]}
                  style={{ marginBottom: "1rem" }}
                >
                  <Select
                    {...selectCommonProps}
                    disabled={!form.getFieldValue('pelabuhan')}
                    placeholder="Pilih barang"
                    options={listBarang}
                    onChange={(_, data) => setSelectedBarang(data?.detail)}
                  />
                </Form.Item>

                <Form.Item
                  name="deskripsi"
                  label="Deskripsi"
                  style={{ marginBottom: "1rem" }}
                >
                  <TextArea
                    className={(isDarkMode ? 'color-white' : 'disable-text') + ' w-100'}
                    disabled
                  />
                </Form.Item>

                <Form.Item
                  name="diskon"
                  label="Diskon"
                  style={{ marginBottom: "1rem" }}
                >
                  <InputNumber
                    {...inputNumberProps}
                    formatter={formatterDiskon}
                    parser={parserDiskon}
                    disabled={!selectedBarang}
                    placeholder='Masukkan diskon'
                    suffix="%"
                    onChange={(value) => calculateTotal(value, 'diskon')}
                  />
                </Form.Item>

                <Form.Item
                  name="harga"
                  label="Harga"
                  rules={[
                    {
                      required: true,
                      message: "Tolong masukkan harga!",
                    },
                  ]}
                  style={{ marginBottom: "1rem" }}
                >
                  <InputNumber
                    disabled={!selectedBarang}
                    placeholder='Masukkan harga'
                    onChange={(value) => calculateTotal(value, 'harga')}
                    {...inputNumberProps}
                  />

                </Form.Item>

                <Form.Item
                  name="total"
                  label="Total"
                  style={{ marginBottom: "1rem" }}
                >
                  <InputNumber
                    disabled
                    {...inputNumberProps}
                    className={(isDarkMode ? 'color-white' : 'disable-text') + ' w-100'}
                  />

                </Form.Item>

                <Form.Item className="mt-4">
                  <Button
                    block
                    type="primary"
                    htmlType="submit"
                    loading={false}
                  >
                    Order
                  </Button>
                </Form.Item>
              </Form>
            }
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  )
}

export default App
