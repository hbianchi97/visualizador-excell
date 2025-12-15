'use client';
import { ExternalLink } from 'lucide-react';
import styles from './TableView.module.css';
import TableImageCell from './TableImageCell';
import { parseBRL } from '@/utils/currency';

export default function TableView({ data }) {

    // Format currency (Standard R$ 10.000,00)
    // Format currency (Standard R$ 10.000,00)
    // Format currency (BRL Standard: 1.000,00)
    // Format currency (BRL Standard: 1.000,00)
    const formatMoney = (val) => {
        const numericVal = parseBRL(val);
        // style: 'currency' automatically adds R$ and uses pt-BR separators
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 20 }).format(numericVal);
    };

    // Format discount: remove decimals and add %
    const formatDiscount = (val) => {
        let numVal = val;
        if (typeof val === 'string') {
            numVal = parseFloat(val);
        }

        if (typeof numVal === 'number' && !isNaN(numVal)) {
            return `${Math.floor(numVal)}%`;
        }
        return val ? `${val}%` : '';
    };

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th style={{ width: '130px' }}>Imagem</th>
                        <th>Cidade</th>
                        <th>Bairro</th>
                        <th>Endereço</th>
                        <th>Preço</th>
                        <th>Avaliação</th>
                        <th>Desconto</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => {
                        const city = row['Cidade'] || '';
                        const district = row['Bairro'] || '';
                        const address = row['Endereço'] || '';
                        const price = row['Preço'] || 0;
                        const valuation = row['Valor de Avaliação'] || 0;
                        const discount = row['Desconto'] || 0;
                        const link = row['Link de acesso'] || '';

                        return (
                            <tr key={index}>
                                <td style={{ padding: '8px' }}>
                                    <TableImageCell link={link} />
                                </td>
                                <td>{city}</td>
                                <td>{district}</td>
                                <td className={styles.addressCell} title={address}>{address}</td>
                                <td className={styles.price}>{formatMoney(price)}</td>
                                <td>{formatMoney(valuation)}</td>
                                <td className={styles.discount}>{formatDiscount(discount)}</td>
                                <td>
                                    {link && (
                                        <a href={link} target="_blank" rel="noopener noreferrer" className={styles.link}>
                                            Acessar <ExternalLink size={14} />
                                        </a>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
